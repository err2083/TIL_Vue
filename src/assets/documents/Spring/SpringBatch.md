# 11. 스프링 배치

***이 글은 스프링5 레시피 을 참고해서 쓴 글입니다.***

## 11.0 개요

컴퓨터가 고가였던 시절 퇴근 이후에 기계를 놀리는게 낭비가 커서 당일 처리할 업무를 모았다가 한번에 처리하면 어떨까 고민하게된 결과가 배치 처리입니다.

배치 처리 솔루션은 대부분 오프라인으로 실행되며 시스템 이벤트로 구동되지 않습니다. 과거에는 부득이하게 오프라인으로 배치를 처리했지만 요즘은 정해진 시각에 일정 분량의 작업을 처리하는 일이 아키텍처상 필수 요건인 경우가 많아 오프라인으로 배치 처리합니다. 배치 처리 솔루션은 대부분 요청을 받고 응답을 내는 구조가 아니지만 메시지나 요청의 결과로 배치를 시작할수도 있으며, 배치 처리는 보통 대용량 데이터를 대상으로 실행되며 그 처리 시간이 아키텍처 및 구현상 결정적인 요소로 작용합니다.

B2B 거래, CSV 파일을 로드해 DB레코드를 처리하는 일은 가장 흔한 배치 처리 사례입니다. DB 레코드 자체를 수정하는 게 출력 결과인 경우도 있습니다. 예를 들어 이미지 파일의 크기를 재조정하거나, 어떤 조건에 따라 다른 프로세르를 트리거하는 경우가 그렇습니다. 레거시 시스템이나 임베디드 시스템에서 흔히 쓰이는 고정폭 데이터는 배치 처리하기 알맞은 대상입니다. 성격 자체가 트랜잭션과 무관한 리소스도 배치 처리가 제격입니다. 배치로 처리하면 웹 서비스로는 불가능한 재시도/건너뛰기/실패 기능을 구현할수도 있습니다.

스프링 배치가 유연한건 맞지만 만능 솔루션은 아닙니다. 스프링 배치 역시 중요한 부분은 개발자 재량에 맡깁니다. 예를 들면 스프링 배치의 일반화한 잡 시동 메커니즘은 명령줄, 운영체제 서비스인 유닉스 크론, 쿼츠, 엔터프라이즈 서비스 버스의 이벤트 응답 등으로 구체화할 수 있습니다. 배치 프로세스 상태를 관리하는 방식도 그렇습니다. 스프링 배치에서는 지속 가능한 저장소가 필요한데, 유일한 JobRepository(메타데이터 항목 저장 용도로 스프링 배치가 기본 제공하는 인터페이스) 구현체도 DB는 꼭 필요합니다.

### 런타임 메타데이터 모델

스프링 배치는 잡 단위로 모든 정보와 메타데이터를 총괄한 JobRepository를 중심으로 작동하며 각 잡은 하나 이상의 순차적인 스텝으로 구성됩니다. 스프링 배치에서 스텝은 초기 워크플로를 따라가면서 조건부로 다음 스텝을 진행할 수도 있고 동시성 스텝(두 스텝을 동시에 실행)으로 구성할 수도 있습니다.

잡은 보통 실행 시점에 JobParameter와 역어 Job 자신의 런타임 로직을 매개변수화합니다. 예를 들면 특정 날짜에 해당되는 레코드만 처리하는 잡이 그런 경우 입니다. 그리고 잡 실행을 식별하기 위해 JobInstance를 생성합니다. JobParameter가 연관되어 있으니 JobInstance는 하나뿐입니다. 같은 JobInstance(즉, 같은 Job + JobParameter 세트)가 실행되는 것을 JobExecution이라고 부릅니다. JobExecution은 잡 버전에 대한 런타임 컨텍스트로, 이상적으로는 JobInstance당 하나의 JobExecution(제일 처음 JobInstance가 실행될 때 만들어진  JobExecution)이 존재합니다. 그러나 도중 에러가 나면 JobInstance는 다시 시작해야 하고 그러다 보면 JobExecution이 하나 더 만들어지겠죠. 초기 잡에 속한 각 스텝의 JobExecution에는 StepExecution이 있습니다.

스프링 배치는 잡을 설계/빌드하는 시점에 바라본 모습과 런타임에 바라본 모습이 함께 투영된, 일종의 미러링된 객체 그래프를 지닌다고 볼 수 있습니다. 프로토타입과 인스턴스를 이처럼 나누어 생각하는 건 jBPM 같은 다른 워크플로 엔진의 작동 방식과 비슷합니다.

예를 들어 새벽 2시에 생성하는 일일 보고서가 있다고 합시다. 이 잡은 날짜를 매개변수로 받고 로딩 스텝, 요약 스텝, 출력 스텝으로 모델링할 수 있습니다. 매일 잡이 실행될때마다 JobInstance 및 JobExecution이 새로 생성되고 동일한 JobInstance를 여러 번 재시도하면 그 횟수만큼 JobExecution이 생성될 겁니다.

## 11.1 스프링 배치 기초 공사하기

> 과제

스프링 배치는 우선 JobRepository용 데이터 저장소가 필요하고, 그 외에도 작동에 필요한 구성이 있는데 이들은 대부분 표준화 되어있습니다.

> 해결책

먼저 스프링 배치 DB를 설정한 다음, 앞으로 설명할 솔루션에서 임포트할 수 있도록 스프링 애플리케이션을 구성하겠습니다. 구성은 스프링 배치에서 메타 데이터를 어느 DB에 저장하라고 알려주는 정도 입니다.

> 풀이

JobRepository 인터페이스는 스프링 배치 처리의 첫 단추입니다. 직접 코드를 다룰 일은 없지만 JobRepositorty는 핵심입니다. SimpleJobRepository는 이 인터페이스를 구현한 사실상 유일한 클래스로 JobRepositoryFactoryBean을 이용해 생성하며 배치 처리 상태를 데이터 저장소에 보관하는 일을 합니다. MapJobRepositoryFactoryBean 도 표준 팩토리 빈이지만 인메모리 구현체라서 상태 정보가 저장되지 않기 때문에 주로 테스트용으로 사용합니다.

JobRepository 인스턴스는 DB를 전제로 작동하므로 스프링 배치용 스키마가 미리 구성되어있어야 합니다. 이 스키마는 DB 제품별로 스프링 배치 배포판에 준비되어 있습니다.

```java
@Configuration
@ComponentScan("...")
@PropertySource("classpath:...")
public class BatchConfiguration {
    // ...

    @Bean
    public JobRepositoryFactoryBean jobRepository() {
        JobRepositoryFactoryBean jobRepositoryFactoryBean = new JobRepositoryFactoryBean();
        jobRepositoryFactoryBean.setDataSource(dataSource());
        jobRepositoryFactoryBean.setTransactionManager(transactionManager());
        return jobRepositoryFactoryBean;
    }

    @Bean
    public JobLauncher jobLauncher() throws Exception {
        SimpleJobLauncher jobLauncher = new SimpleJobLauncher();
        jobLauncher.setJobRepository(jobRepository().getObject());
        return jobLauncher;
    }

    @Bean
    public JobRegistryBeanPostProcessor jobRegistryBeanPostProcessor() {
        JobRegistryBeanPostProcessor jobRegistryBeanPostProcessor = new JobRegistryBeanPostProcessor();
        jobRegistryBeanPostProcessor.setJobRegistory(jobRegistory());
        return jobRegistryBeanPostProcessor;
    }

    @Bean
    public JobRegistry jobRegistry() {
        return new MapJobRegistry();
    }
}
```

jobRegistry() 메서드는 MapJobRegistry 인스턴스를 반환합니다. 이 빈은 특정 잡에 관한 정보를 담고 있는 중앙 저장소이자, 시스템 내부의 전체 잡들을 관장하는 빈입니다.

SimpleJobLauncher의 유일한 임무는 배치 잡을 시동하는 메커니즘을 건네주는 겁니다. 여기서 '잡' 이란 사용 중인 배치 솔루션을 말하며 JobLauncher를 사용해 실행할 배치 솔루션명과 필요한 매개변수를 지정합니다.

JobRegistryBeanPostProcessor는 스프링 컨텍스트 파일을 스캐닝해 구성된 잡이 발견되면 MapJobRegistry에 역는 빈 후처리기 입니다.

JobRepository는 저장소를 구현한 객체로 잡과 스텝을 아울러 도메인 모델에 관한 조회/저장 작업을 처리합니다.

클래스 레벨에 @PropertySource를 붙여 스프링이 파일을 로드하도록 지시하고 이렇게 로드한 프로퍼티는 Environment형 필드를 사용해 가져옵니다.

하지만 이런 방식보다는 @EnableBatchProcessing을 붙여 기본값을 바로 구성하는 방법이 더 편합니다.

```java
@Configuration
@EnableBatchProcessing
@ComponentScan("...")
@PropertySource("...")
public class BatchConfiguration {}
```

이렇게 하면 JobRepository, JobRegistry, JobLauncher는 기본으로 구성됩니다. 애플리케이션 데이터 소스가 여럿이면 명시적으로 BatchConfigurer를 추가해서 배치 처리 시 사용할 데이터 소스를 선택하도록 해주면 됩니다.

```java
public class Main {
    public static void main(String[] args) throws Throwable {
        ApplicationContext context = new AnnotationConfigApplicationContext(BatchConfiguration.class);

        JobRegistry jobRegistry = context.getBesn("jobRegistry", JobRegistry.class);
        // JobLauncher, JobRepository
    }
}
```

## 11.2 데이터 읽기/쓰기

> 과제

CSV 파일에서 데이터를 읽어 DB에 입력하려고 합니다. 스프링 배치의 가장 단순한 쓰임새지만 핵심 컴포넌트를 살펴볼수 있습니다.

> 해결책

임의 길이의 파일을 읽어 그 테이블을 DB에 넣는 애플리케이션으로 코드가 거의 없습니다. 기존 모델 클래스는 그대로 두고 Main 클래스 하나만 작성만으로 할 수 있습니다. 모델 클래스를 하이버네이트나 다른 DAO 기술로 구현하지 말라는 법은 없지만 POJO로 사용하겠습니다.

> 풀이

이번 예제는 확장성을 제공하는 가장 단순한 스프링 배치의 응용 사례를 잘 보여줍니다. 프로그램 로직은 콤마와 개행문자로 구분된 CSV파일에서 데이터를 읽어 DB 테이블에 레코드를 삽입하는 일이 전부입니다. 스프링 배치를 사용하면 확정성 및 트랜잭션, 재시도 같은 문제를 신경쓰지 않아도 됩니다.

스프링 배치는 XML 스키마를 이용해 솔루션 모델을 정의합니다. 스프링 배치는 쓸 만한 클래스를 기본 제공하므로 선택적으로 조정하거나 오버라이드해 쓰면 됩니다.

편의상 테이블을 만들어보겠습니다.

```java
create table USER_REGISTRATION (
    ID BIGINT NOT PRIMARY KEY GENERATED ALWAYS AS IDENTITY (START WITH 1, INCREMENT BY 1),
    FIRST_NAME VARCHAR(255) not null,
    LAST_NAME VARCHAR(255) not null,
    COMPANY VARCHAR(255) not null,
    ADDRESS VARCHAR(255) not null,
    CITY VARCHAR(255) not null,
    STATE VARCHAR(255) not null,
    ZIP VARCHAR(255) not null,
    COUNTY VARCHAR(255) not null,
    URL VARCHAR(255) not null,
    PHONE_NUMBER VARCHAR(255) not null,
    FAX VARCHAR(255) not null
);
```

스프링 배치 애플리케이션은 일개미처럼 묵묵히 일하면서도 여러분이 미처 몰랐던 병목점을 발견할 수도 있습니다. 만일 10분마다 1,000,000개 로우를 DB에 넣으면 어떻게 될까요? 소프트웨어 개발자는 사용 중인 DB 스키마가 비즈니스 로직의 제약조건을 얼마나 준수하는지, 전체 비즈니스 모델을 얼마나 잘 반영하는지 이해해야 합니다. 또한 DBA 관점에서 보는것도 중요합니다. 일반적으로 테이블을 반졍규화하고 삽임 트리거를 걸어 무조건 유효한 데이터만 DB 안으로 들어오게 강제하는 방법을 씁니다. 데이터 웨어하우징에서 많이 사용하는 기법입니다. 스프링 배치를 이용해 데이터 삽입하기 전에 처리할 수도 있습니다. 이런식으로 DB에 넣는 레코드를 확인하거나 오버라이드할 수 있습니다.

### 잡 구성하기

```java
@Configuration
public class UserJob {
    private static final String INSERT_REGISTRATION_QUERY = "insert into USER_REGISTRATION (FIRST_NAME, LAST_NAME, COMPANY, ADDRESS, CITY, STATE, ZIP, COUNTY, URL, PHONE_NUMBER, FAX) values (:firstName, :lastName, :company, :address, :city, :state, :zip, :county, :url, :phoneNumber, :fax)"

    @Autowired
    private JobBuilderFactory jobs;

    @Autowired
    private StepBuilderFactory steps;

    @Autowired
    private DataSource dataSource;

    @Autowired
    @Value("file:${user.home}/batches/registrations.csv")
    private Resource input;

    @Bean
    public Job insertIntoDbFromCsvJob() {
        return jobs.get("User Registration Import Job")
            .start(step1())
            .build();
    }

    @Bean
    public Step step() {
        return steps.get("User Registration CSV To DB Step")
            .<UserRegistration,UserRegistration>chunk(5)
            .reader(csvFileReader())
            .writer(jdbcItemWriter())
            .build();
    }

    @Bean
    public FlatFileItemReader<UserRegistration> csvFileReader() {
        FlatFileItemReader<UserRegistration> itemReader = new       FlatFileItemReader<>();
        itemReader.setLineMapper(lineMapper());
        itemReader.setResource(input)
        return itemReader;
    }

    @Bean
    public JdbcBatchItemWriter<UserRegistration> jdbcItemWriter() {
        jdbcBatchItemWriter<UserRegistration> itemWriter = new      JdbcBatchItemWriter<>();
        itemWriter.setDataSource(dataSource);
        itemWriter.setSql(INSERT_REGISTRATION_QUERY);
        itemWriter.setItemSqlParameterSourceProvider(new BeanPropertyItemSqlParameterSourceProvide<>());
        return itemWriter;
    }

    @Bean
    public DefaultLineMapper<UserRegistration> lineMapper() {
        DefaultLineMapper<UserRegistration> lineMapper = new DefaultLineMapper<>();
        lineMapper.setLineTokenizer(tokenizer());
        lineMapper.setFieldSetMapper(fieldSetMapper());
        return lineMapper;
    }

    @Bean
    public BeanWrapperFieldSetMapper<UserRegistration> fieldSetMapper() {
        BeanWrapperFieldSetMapper<UserRegistration> fieldSetMapper = new BeanWrapperFieldSetMapper<>();
        filedSetMapper.setTargetType(UserRegistration.class);
        return fieldSetMapper;
    }

    @Bean
    public DelimitedLineTokenizer tokenizer() {
        DelimitedLineTokenizer tokenizer = new DelimitedLineTokenizer();
        tokenizer.setDelimiter(",");
        tokenizer.setNames(new String[]{"firstName", "lastName", "company", "address", "city", "state", "zip", "county", "url", "phoneNumber", "fax"});
        return tokenizer;
    }
}
```

잡은 여러 스텝으로 구성되며 각 스텝은 주어진 잡을 수행합니다. 스텝은 잡을 수행하는 가장 작은 단위로, 단순할수도 복잡할수도 있습니다. 입력이 스텝으로 전해지고 처리가 끝나면 출력이 만들어집니다. 처리 로직은 Tasket(스프링 배치의 인터페이스)으로 기술합니다. Tasket은 직접 구현해도 되고 여러 처리 시나리오에 맞게 짜여진 것중 하나를 골라 써도 됩니다. 배치 처리의 가장 중요한 단면 중 하나인 청크 지향 처리를 할 경우는 chunk()라는 구성 메서드를 사용합니다.

청크 지향 처리에서는 입력을 읽고 부가적인 처리를 한 뒤 애그리게이션(종합)합니다. 마지막으로 commit-interval 속성으로 처리 주기를 설정해서 트랜잭션을 커밋하기 전에 얼마나 많은 아이템을 출력기로 보낼지 정합니다. 이미 가동 중인 트랜잭션 관리자가 있으면 트랜잭션도 함께 커밋합니다. 커밋 직전에 DB 메터데이터를 수정해서 해당 잡을 완료했다는 사실을 알립니다.

트랜잭션을 인지한 출력기가 롤백할 때는 입력값을 집계하는 문제와 관련해 미묘한 차이가 발생합니다. 스프링 배치는 읽은 값을 캐시했다가 출력기에 씁니다. 출력기는 DB처럼 트랜잭션이 걸려 있지만 입력기는 트랜잭션이 걸려 있지 않으면 읽은 값을 캐시하거나 재시도 또는 다른 방법으로 접근하더라도 본질적으로 잘못될 건 없습니다. 그런데 입력기에도 트랜잭션이 적용된 상태면 리소스에서 읽은 값이 롤백되고 변경 가능한 상태로 메모리에 남겨진 캐시값은 무용지물이 됩니다. 이런 일이 발생할 경우 reader-transactional-quere="ture"로 설정해 청크 엘리먼트에 값을 캐시하지 않도록 설정하면 됩니다.

### 입력

첫 번째는 파일을 읽어야 합니다. 예제는 스프링 배치가 기본 제공한 기본 구현체를 사용하도록 하겠습니다. org.springframework.batch.item.file.FlatFileItemReader\<T> 클래스는 파일의 필드와 값을 구분하는 작업을 LineMapper\<T> 에게 맡기고 LineMapper\<T>는 전달받은 레코드에서 필드를 식별하는 작업을 다시 LineTokenizer에게 맡깁니다.

DefaultLineMapper의 fieldSetMapper 속성에는 FieldSetMapper 구현체를 넣습니다. 이 빈은 이름-값 쌍을 건네받아 출력기에 전달할 타입을 생산합니다.

예제에서는 UserRegistration형 POJO를 생성하는 BeanWrapperFieldSetMapper를 사용했습니다. 필드명을 입력 파일의 헤더 로우와 똑같이 명명할 필요는 없지만 입력 파일에 등장하는 순서와 동일하게 대응시켜야 합니다. 이 필드명을 이용해 FieldSetMapper가 POJO 프로퍼티를 역습니다. 레크드를 한 줄씩 읽을 때마다 해당 값들을 POJO 인스턴스에 적용한 뒤 그 객체를 반환합니다.

```java
public class UserRegistration implements Serializable {
    private String firstName;
    private String lastName;
    private String company;
    private String address;
    private String city;
    private String state;
    private String zip;
    private String county;
    private String url;
    private String phoneNumber;
    private String fax;
}
```

### 출력

출력기는 입력기가 읽은 아이템 컬렉션을 한데 모아 처리하는 작업을 담당합니다. 예제에서는 새 컬렉션을 만들어 계속 데이터를 써넣으면서 그 개수가 chunk 엘리먼트의 commit-interval 속성값을 초과할 때마다 다시 초기화합니다. 스프링 배치 org.springframework.batch.item.database.JdbcBatchItemWriter는 데이터를 입력받아 DB에 출력하는 클래스입니다. 전달받은 입력 데이터에 어떤 SQL을 실행할지는 개발자가 정해야하고, commit-interval 값에 따라 일정 주기로 DB에서 데이터를 읽어 sql 프로퍼티에 설정한 SQL을 실행한 뒤 전체 트랜잭션을 커밋합니다. 기명 매개변수의 이름-값은 itemSqlParameterSourceProvider프 프로퍼니에 설정한 BeanPropertyItemSqlParameterSourceProvider형 빈이 생성합니다. 이 빈은 자바빈 프로퍼티와 기명 매개변수를 서로 연관짓는 역할을 맡습니다.

여기까지가 대용량 CSV 파일을 읽어 DB에 넣는 솔루션잆니다. 정 반대의 작업(DB에서 데이터를 읽어 CSV 파일로 쓰기)을 하는 클래스 역시 비슷합니다.

### ItemReader/ItemWriter를 간단하게 구성하기

ItemReader/ItemWriter 구성은 적잖은 스프링 배치 관려 지식을 요구하지만, 다행히 스프링 배치 4부터 입출력기 마다 빌더를 제공해므로 구성작업이 편해졌습니다.

예를 들면 FlatFileItemReader는 FlatFileItemReaderBuilder로 구성하는데, 빈마다 일일이 구성할 필요 없이 간단하게 끝납니다.

```java
@Bean
public FlatFileItemReader<UserRegistration> csvFileReader() throws Exception {
    return new FlatFileItemReaderBuilder<UserRegistration>()
        .name(ClassUtils.getShortName(FlatFileItemReader.class));
        .resource(input)
        .targetType(UserRegistration.class)
        .delimited()
        .names(new String[]{"firstName", "lastName", "company", "address", "city", "state", "zip", "county", "url", "phoneNumber", "fax"})
        .build();
}
```

FlatFileItemReaderBuilder는 DefaultLineMapper, BeanWrapperFieldSetMapper, DelimitedLineTokenizer를 자동 생성하므로 물밑에서 무슨 일이 일어나는지 몰라도 됩니다.

JdbcBatchItemWriter와 JdbcBatchItemWriterBuilder의 관계도 마찬가지입니다.

```java
@Bean
public JdbcBatchItemWriter<UserRegistration> jdbcItemWriter() {
    return new JdbcBatchItemWriterBuilder<UserRegistration>()
        .dataSource(dataSource)
        .sql(INSERT_REGISTRATION_QUERY)
        .beanMapped()
        .build();
}
```

## 11.3 커스텀 ItemWriter/ItemReader 작성하기
