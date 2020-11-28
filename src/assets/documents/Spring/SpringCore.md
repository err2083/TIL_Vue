# 1. 스프링 코어

***이 글은 스프링5 레시피 을 참고해서 쓴 글입니다.***

## 1.0 개요

     IoC(Inversion of Control) 는 스프링 프레임워크의 심장부라고 할수 있습니다.
     IoC 컨테이너는 POJO (오래된 방식의 단순 자바 객체) 를 구성하고 관리합니다.
     스프링 프레임워크의 가장 중요한 의의가 이 POJO로 자바 애플리케이션을 개발하는 것이므로
     스프링의 주요 기눙운 대부분 IoC 컨테이너 안에서 POJO를 구성 및 관리하는 일과 연관돼 있습니다.
     
## 1.1 자바로 POJO 구성하기

    @Configuration, @Bean을 붙인 자바 구성 클래스를 만들거나, @Component, @Repository,
    @Service, @Controller 등을 붙인 자바 컴포넌트를 구성합니다. IoC 컨테이너는 이렇게 
    어노테이션을 붙인 자바 클래스를 스캐닝하여 애플리케이션의 일부인것처럼 POJO인스턴스/빈을 구성합니다.
    
    @Configuration은 이 클래스가 구성 클래스임을 스프링에게 알리고 @Bean 을 붙인 메서드를 찾습니다.
    @Bean을 붙이면 그 메서드와 동일한 이름의 빈이 생성됩니다.
    
    애노케이션을 붙인 자바 클래스를 스캐닝하려면 우선 IoC 컨테이너를 인스턴스화해야 합니다.
    스프링은 기본 구현체인 Bean Factory 와 이와 호환되는 고급 구현체인 Application context
    두가지 IoC 컨테이너를 제공합니다. Application context 은 빈 팩토리보다 발전된 기능을 가지고
    있으므로 리소스 제약을 받는 상황이 아니라면 이를 사용하는것이 좋습니다.
    Application context 는 Bean Factory의 하위 인터페이스로 호환성이 보장됩니다.
    ApplicationContext 는 인터페이스 이므로 구현체가 필요합니다.
    스프링은 이를 위해 몆가지 구현체를 마련했는데 가장 유명한 AnnotationConfigApplicationContext를 
    권장합니다.
    
```java
public class Main {
    public static void main() {
        ApplicationContext context = new AnnotationConfigApplicationContext(className.class);    
    }
}
```
    ApplicationContext 를 인스턴스화한 이후에 객체 레퍼런스는 빈에 액세스하는 창구 노릇을 합니다.
    
    구성 클래스에 선언된 빈 팩토리 또는 애플리케이션 컨텍스트 에서 가져오려면 getBean() 메서드의 인수로 호출합니다
    ClassName classname = (ClassName) context.getBean("ClassName");
    또는
    ClassName classname = context.getBean("ClassName", ClassName.class);
    이런식으로 POJO 인스턴스/빈을 스프링 외부에서 생성자를 이용해 객체처럼 사용할 수 있습니다.
    
    클래스에 @Component 를 붘이연 스프링은 이 클래스를 이용해 POJO를 생성합니다.
    또한 스프링에는 퍼시스턴스, 서비스, 프레젠테이션 세 레이어가 있는데 이는 각각
    @Repository, @Service, @Controller 이 세 레이어를 가리키는 애너테이션입니다.
    
    기본적으로 스프링은 @Configuration, @Bean, @Component, @Repository, @Service, @Controller
    가 달린 클래스를 모두 감지합니다. 이때 필터를 이용하여 스캐닝 과정을 커스터마이징 할수 있습니다.
    예를 들어 다음과 같이 선언하면 Dao 나 Service가 포함된 클래스는 스프링이 감지하고 @Controller 를 붙인 클래스는 제외합니다.
```java
@ComponentScan(
    includeFilters = {
        @ComponentScan.Filter(
            type = FilterType.REGEX,
            pattern = {"package.*Dao", "package.*Service"}
        )       
    },
    excludeFilters = {
        @ComponentScan.Filter(
            type = FilterType.REGEX,
            pattern = {"package.stereotype.Controller.class"}
        )
    }
)
```
## 1.2 생성자 호출해서 POJO 생성하기
    POJO 클래스에 생성자를 하나 이상 정의하고, 자바 구성 클래스에서 IoC 컨테이너가 사용할
    POJO 인스턴스 값을 생성자로 설정한 다음 IoC 컨테이너를 인스턴스화 해서 애너테이션을
    붙인 자바 클래스를 스캐닝 하도록 합니다.
```java
@Configuration
public class ShopConfiguration {
    @Bean
    public Object star() {
        Object star = new Object();
        return star;
    }
}

public class Main {
    public static void main() {
       ApplicationContext context = new AnnotationConfigApplicationContext(ShopConfiguration.class);
        
       Object star = context.getBean("star", Object.class);
    }
}
```

## 1.3 POJO 레퍼러스와 자동 연결을 이용해 다른 POJO 와 상호 작용하기
    자바 구성 클래스에 정의된 POJO/빈 인스턴스들 사이의 참조 관계는 표준 자바 코드로도 맺어줄수 있습니다.
    필드, 세터 메서드, 생성자 또는 다른 아무 메서드에 @Autowired를 붙이면 POJO 레퍼런스를 자동으로 연결해 쓸수 있습니다
    
    서비스 객체를 생성하는 서비스 클래스는 직접 대상 클래스를 호출하는 대신 퍼사드를 두어 내부적으로 연동하여 호출하게 됩니다.
    만일 배열형 프로퍼티에 @Autowired를 붙이면 스프링은 매치된 빈을 모두 찾아 연결하게 됩니다.
```java
public class Class {
    @Autowired
    private ClassName[] classNames;
}
```
    배열 뿐만 아나라 타입 안전한 컬렉션(List, Map) 도 빈을 모두 찾아 등록하게 됩니다.
    
    @Autowired 는 POJO 세터 메서드에도 직접 적용할수 있습니다.
```java
public class Class {
    private ClassName className;
    
    @Autowired
    public void setClassName(ClassName className) {
        this.className = className;
    }
}
```
    스프링은 기본적으로 @Autowired 를 붙인 필수 프로퍼티에 해당하는 빈을 찾지 못하면
    예외를 던지는데 @Autowired의 required 속성값을 false로 지정해 스프링 빈을 못찾더라도
    그냥 지나치게 합니다.
    또한 생성자에도 똑같이 적용할수 있습니다(스프링 4.3 버전부터 @Autowired 키워드 생략 가능)
    
    만일 IoC 컨테이너에 호환 타입이 여럿 존재하는 경우 @Primary, @Qualifier 로 해결할 수 있습니다.
    @Primary 는 특정 빈에 우선권을 부여하는것으로 특정 타입의 빈 인스턴스가 여럿이라도 스프링은
    @Primary를 붙인 클래스의 빈 인스턴스를 자동을 연결합니다.
    
    @Qualifier는 빈을 주입하는 곳에 후보 빈을 명시하게 합니다.
```java
public class Class {
    @Autowired
    @Qualifier("name")
    private ClassName className;
}
```
    이는 마찬가지로 생성자 메서드에 인수를 prefix 에 붘여 동일하게 처리할수 있습니다
    
    애플리케이션 규모가 커지면 POJO 설정을 하나의 자바 구성 클래스에 담아두기 어렵기 때문에
    여러 구성 클래스에 나누어 관리합니다.
    
    한가지 방법은 자바 구성 클래스가 위치한 경로마다 애플리케이션 컨텍스트를 초기화하거나,
    @Import로 구성 파일을 나누어 임포트하는 벙법이 있습니다.
    @Import(ClassName.class) 를 붙이면 ClassName 에서 정의한 POJO를 모두
    현재 구성 클래스의 스코프로 가져올 수 있습니다.
    // TODO 세터 필드 생성자 차이점 기술하기 (순환참조 문제 + a)
    
## 1.4 @Resource와 Inject를 붙여 POJO 자동 연결하기
    @Autowired 는 스프링 전용 애너테이션으로, 자바 표준 애너테이션 @Resource(이름), @Inject(타입)로
    POJO를 자동 연결하여 사용할수 있습니다.
    
    @Autowired 는 타입이 같은 POJO가 여럿일때 쓰면 대상이 모호해져 @Qualifier를 써서 이름으로
    다시 찾아야하는 불편함이 있지만 @Resource 는 대상이 명확합니다.
    
    반면 @Inject 는 타입이 같이 POJO가 여럿일때엔 다른 방법을 구사해야하는데
    POJO 주입 클래스와 주입 지점을 구별하기 위한 커스텀 애너테이션을 작성해야 합니다.
```java
@Qualifier
@Target({ElementType.TYPE, ElementType.FIELD, ElementType.PARAMENTER})
@Documented
@Retention(RetentionPolicy.RUNTIME)
public @interface AnnotationName{
}
```
    이 커스텀 애너테이션을 붙인 @Qualifier는 스프링에서 쓰는 @Qualifier 와는 전혀 다른 패키지에
    속한 애너테이션입니다. 이를 빈 인스턴스를 생성하는 POJO 주입 클래스에 붙이면 됩니다.
    
## 1.5 @Scope를 붙여 POJO 스코프 지정하기
    @Component 같은 애노테이션을 POJO에 붙이는 건 빈 생성에 관한 템플릿을 정의하는것이지, 실제
    빈 인스턴스를 정의하는게 아닙니다. 빈 요청을 할때 스프링은 빈 스코프에 따라 어느 빈 인스턴스를
    반환할지 결정합니다. 이런 상황에서 사용하는게 @Scope 애너테이션으로 빈 스코프를 지정합니다.
    스프링은 IoC 컨테이너에 선언한 빈 마다 인스턴스를 하나 생성하고 이는 전체 컨테이너 스코프에
    공유됩니다. 이 스코프가 모든 빈의 기본 스코프인 singleton 입니다.
|스코프|설명|
|---------|---|
|singleton|IoC 컨테이너당 빈 인스턴스 하나를 생성합니다|
|prototype|요청할 때마다 빈 인스턴스를 새로 만듭니다.|
|request|HTTP 요청당 하나의 빈 인스턴스를 생성합니다. 웹 애플리케이션 컨텍스트만 해당됩니다.
|session|HTTP 세션당 빈 인스턴스 하나를 생성합니다. 웹 애플리케이션 컨텍스트에만 해당됩니다.
|globalSession|전역 HTTP 세션당 빈 인스턴스 하나를 생성합니다. 포털 애플리케이션 컨텍스트에만 해당됩니다.
    
## 1.6 외부 리소스(텍스트, XML, 프로퍼티, 이미지 파일)의 데이터 사용하기
    스프링이 제공하는 @PropertySource를 이용하면 빈 프로퍼티 구성용 .properties 파일을 읽을수 있습니다.
    또 Resource라는 단일 인터페이스를 사용해 어떤 유형의 외부 리소스라도 경로만 지정하면 가져올 수 있는
    리소스 로드 메커니즘이 마련되어 있습니다. @Value로 접두어를 달리 하여 상이한 위치에 존재하는 리소스를 불러
    올 수도 있습니다. 예를 들면 파일시스템 리소스는 file, 클래스패스에 있는 리소스는 classpath.
    리소스 경로는 URL로도 지정 가능합니다.
    
    @PropertySource와 PropertySourcesPlaceholderConfigurer 클래스를 이용하면 빈 프로퍼티
    구성 전용 프로퍼티 파일의 내용(키-값 쌍)을 읽을 수 있습니다. 스프링 Resource 인터페이스에 @Value를
    곁들이면 어느 파일이라도 읽어들일수 있습니다.
    
    예시로 discounts.properties 파일에 다음과 같이 있다고 합시다.
````properties
specialcustomer.discount=0
summer.discount=0.15
endofyear.discount=0.2
````
````java
@Configuration
@PropertySource("classpath:discounts.properties")
@ComponentScan("com.apress.springrecipes.shop")
public class ShopConfiguration {
    @Value("${endofyear.discount:0}")
    private double specialEndofyearDiscountField;
    
    @Bean
    public static PropertySourcesPlaceholderConfigurer configurer() {
        return new PropertySourcesPlaceholderConfigurer();
    }
    
    @Bean
    public Integer starlight() {
        return new Integer(specialEndofyearDiscountField);
    }
}
````
    값이 classpath:discounts.properties 인 @PropertySource를 자바 구성 클래스에 붙였습니다.
    스프링은 자바 클래스패스에서 해당 파일을 찾습니다.
    @PropertySource를 붙여 프로퍼티 파일을 로드하려면 PropertySourcesPlaceholderConfigurer 빈을
    @Bean 으로 선언해야합니다. 스프링은 해당 파일을 자동으로 연결하여 파일에 나열된 프로퍼티를 빈 프로퍼티로 활용
    할 수 있습니다. @Value("key:default_value") 는 해당 프로퍼티 파일에 키를 찾아보고 값을 넣어주는데 없으면
    default_value 를 할당합니다.
    
    프로퍼티 파일 데이터를 빈 프로퍼티 구성 외의 다른 용도로 쓰려면 Resource 메커니즘을 이용해야합니다.
    private Resource txt; 라는 코드가 있을때
    @Value 에 값을 .txt 로 세팅한다고 생각하면 미리 등록된 프로퍼티 편집기 ResourceEditor를 이용해
    파일을 빈에 주입하기 전 Resource 객체로 변환합니다.
    
    만일 서비스에서 프로퍼티를 읽어야한다면 다음과 같이 할 수 있습니다.
```java
public class Main {
    public static void main(String[] args){
        Resource resource = new ClassPathResource("discounts.properties");
        Properties props = PropertiesLoaderUtils.loadProperties(resource);
    }
}
```
    해당 프로퍼티 파일의 경우 자바 클래스패스에 있다고 가정했지만 외부 파일시스템에 있는 리소스는
    FileSystemResource로 가져옵니다.
    URL로 외부 리소스를 액세스 하려면 스프링 UrlResource를 이용합니다.
    
## 1.7 프로퍼티 파일에서 로케일마다 다른 다국어 메시지를 해석하기
    MessageSource 인터페이스에는 리소스 번들 메시지를 처리하는 메서드가 정의 되어있습니다.
    ResourceBundleMessageSource는 가장 많이 쓰는 구현체로 로케일 별로 분리된 리소스 번들 메시지를
    해석합니다.
```java
@Configuration
public class ShopConfiguration {
    @Bean
    public ReloadableResourceBundleMessageSource messageSource() {
        ReloadableResourceBundleMessageSource messageSource =
            new ReloadableResourceBundleMessageSource();
        messageSource.setBasenames("classpath:messages");
        messageSource.setCacheSeconds(1);
        return messageSource;
    }
}
```
    빈 인스턴스는 반드시 messageSource 라고 명명해서 애플리케이션 컨텍스트가 알아서 감지합니다.
    setBasenames 는 번들 위치를 지정, setCacheSeconds 는 캐시 주기를 1초로 해서 쓸모없는 메시지를
    다시 읽지 않게 합니다. 이렇게 MessageSource를 정의하고 영어가 주 언어인 미국 로케일애서 텍스트를 찾으면
    messages_en_US.properties 리소스 번들 파일이 읽혀집니다.
```java
@Component
public class Cashier {
    @Autowired
    private MessageSource messageSource;
    public void checkout() {
        String message = messageSource.getMessage("key", null, Locale.US);
        System.out.println(message);
    }
}
```
## 1.8 애너테이션을 이용해 POJO 초기화/폐지 커스터마이징하기
    어떤 POJO는 사용하기 전에 특정한 초기화 작업을 거쳐야 합니다. 예를 들어 파일을 열거나, 네트워크/DB 요청,
    메모리 할당 등 선행 작업이 필요한 경우입니다. 이런 POJO 는 생명이 다하는 순간 폐기 작업을 진행해주어야
    합니다. 자바 구성 클래스의 @Bean 정의부에서 initMethod, destroyMethod 속성을 설정하면
    스프링은 이들을 각각 초기화, 폐기 콜백 메서드로 인지합니다. 또는 POJO 메서드에 각각
    @PostConstruct 및 PreDestory 를 붙여도 됩니다. 또 스프링은 @Lazy 를 붙여 주어진 시점까지
    빈 생성을 미룰수 있고, @DependsOn 으로 빈 생성전에 다른 빈 생성을 강제할수 있습니다.
    다음은 파일 작업을 하는 클래스 입니다.
```java
public class FileLorder {
    @Setter
    private String fileName;
    @Setter
    private String path;
    @Setter
    private String extension;
    private BufferedWriter writer;
    
    public void openFile() throws IOException {
        File targetDir = new FIle(path);
        if (!targetDir.exists()) {
            targetDir.mkdir();
        }
        File checkoutFile = new FIle(path, fileName + extension);
        if (!checkoutFile.exists()) {
            checkoutFile.createNewFile();
        }

        writer = new BufferedWriter(new OutputStreamWriter(
                new FileOutputStream(checkoutFile, true)));
    }

    public void checkout() throws IOExcetion {
        writer.write(/*content*/);
        writer.flush();
    } 
    public void closeFile() throws IOException {
        writer.close();
    }   
}
```
    FileLorder 클래스을 빈 생성 이전에 openFile() 메서드를 폐기 직전에 closeFile() 메서드를
    실행하도록 자바 구성 클래스에 빈 정의부를 설정합시다.
```java
@Configuration
public class ShopConfiguration {
    @Bean(initMethod="openFile", destroyMethod="closeFile")
    public FileLoader fileLoader() {
        // ...
    }
}
```
    @Bean 의 initMethod, destroyMethod 속성에 각가 초기화, 폐기 작업을 할 메서드를 지정하면
    인스턴스 생성전에 메서드를 먼저 트리거 할 수 있습니다.
    
    자바 구성 클래스 와부에 POJO 클래스를 정의할 경우 클래스에 @Component 를 붙이고
    초기화할 메서드에 @PostConstruct, 폐기 메서드에 @PreDestory 을 지정하면 됩니다.
    
    스프링은 모든 POJO를 애플리케이션 시동과 동시에 POJO를 초기화합니다. 이 초기화를 뒤로 미루는 개념을
    느긋한 초기화 라고 합니다. 주로 네트워크 접속, 파일 처리 등에 사용됩니다.
    빈에 @Lazy 를 붘이면 적용이 됩니다.
    
    POJO가 늘어나면 그에 따른 POJO 초기화 횟수도 증가하게 됩니다. 이때 자바 구성 클애스에 분산 선언된
    많은 POJO가 서로를 참조하게 되면 경합조건이 일어나기 쉽습니다. 이는 A라는 빈이 B에 의존하는 경우에
    B가 생성전에 A가 생성되는 것입니다. 이때 @DependsOn 애너테이션을 붘여 POJO 순서를 강제할수 있습니다.
    자바 구성 클래스의 빈에 @DependsOn("className") 를 붙이면 해당 빈은 className 보다
    늦게 생성됩니다.

## 1.9 후처리기를 만들어 POJO 검증/수정하기
    빈 후처리기를 이용하면 초기화 콜백 메서드(@initMethod ,@PostConstruct) 전후 원하는 로직을
    빈에 적용할수 있습니다. 빈 후처리기는 IoC 컨테이너 내부의 모든 빈 인스턴스를 대상으로 합니다.
    @Required는 스프링에 내장된 후처리기 RequiredAnnotationBeanPostProcessor가 지원하는
    애너테이션 입니다.
    
    빈 후처리기는 BeanPostProcessor 인터페이스를 구현한 객체입니다. 이 인터페이스를 구현한 객체를
    발견하면 스프링은 모든 빈 인스턴스에 postProcessBeforeInitialization(),
    postProcessAfterInitialization() 두 메서드를 적용합니다.
```java
@Component
public class AuditCheckBeanPostProcessor implements BeanPostProcessor {
    @Override
    public Object postProcessBeforeInitialization(Object bean, String beanName) 
        throws BeanException {
        return bean;
    }
}
```
    postProcessBeforeInitialization(), postProcessAfterInitialization() 메서드는
    반드신 빈 인스턴스를 반환해주어야 합니다. 애플리케이션 컨텍스트는 BeanPostProcessor 구현 빈을 감지해
    컨테이너 안에 있는 다른 빈 인스턴스에 일괄 적용합니다.
    
    특정 빈 프로퍼티가 설정되어있는지 체크하고 싶은 경우 커스텀 후처리기를 작성하고 해당 프로퍼티에
    @Required를 붙입니다. 이를 붙인 프로퍼티는 스프링이 감지해서 값의 존재 여부를 조사하고 
    프로퍼티값이 없으면 BeanInitializationException 예외를 던집니다.

## 1.10 팩토리(정적 메서드, 인스턴스 메서드, 스프링 팩토리빈)로 POJO 생성하기
    자바 구성 클래스의 @Bean 메서드는 정적 팩토리를 호출하거나 인스턴스 팩토리 메서드를 호출해서
    POJO를 생성할 수 있습니다. 스프링은 FactoryBean 인터페이스를 상속한 AbstractFactoryBean을 제공합니다.
    
    먼저 정적 메서드를 이용해서 POJO 생성을 살펴보면
```java
public class ProductCreator {
    public static Product createProduct(String id) {
        // id 에 따라 객체 반환
    }
}

@Configuration
public class ShopConfiguration {
    @Bean
    public Product star() {
        return ProductCreator.createProduct("star");
    }
}
```
    자바 구성 클래스 @Bean 메서드에서 일반 자바 구문으로 정적 메서드를 호출해 POJO를 생성합니다.
    
    다음은 인스턴스 팩토리 메서드로 POJO 생성을 살펴보면
```java
public class ProductCreator {
    @Setter
    private Map<String, Product> products;
    
    public Product createProduct(String id) {
        return products.get(id);
    }
}

@Configuration
public class ShopConfiguration {
    @Bean
    public ProductCreator productCreatorFactory() {
        // map 세팅후 반환
    }
    @Bean
    public Product star() {
        return productCreatorFactory().createProduct("star");
    }
}
```
    다음은 스프링 팩토리 빈으로 POJO 생성하는 방법입니다.
```java
public class StarFactoryBean extends AbstractFactoryBean<Star> {
    private Star star;    

    @Override
    public Class<?> getObjectType() {
        return star.getClass();
    }
    @Override
    protected Star createInstance() throws Exception {
        return star;
    }
}
```
    팩토리 빈은 제너릭 클래스 AbstractFactoryBean<T> 를 상속하고, createInstance() 메서드를
    오버라이드해 대상 빈 인스턴스를 생성합니다. 또 자동 연결 기능이 작동하도록 getObjectType도 
    빈 타입을 반환합니다.
    이제 자바 구성 클래서에서 인스턴스를 생성하는 팩토리 빈에 @Bean을 붙여 StarFactoryBean을 적용합니다.
```java
@Configuration
@ComponentScan("package")
public class StarConfiguration {
    @Bean
    public Lunar lunar() {
        Lunar lunar = new Lunar();
        return lunar;
    }
    @Bean
    public StarFactoryBean starFactoryBeanLunar() {
        StarFactoryBean factory = new StarFactoryBean();
        factory.set(lunar());
        return factory;
    }
}
```

## 1.11 스프링 환경 및 프로파일마다 다른 POJO 로드하기
    자바 구성 클래스를 여러개 만들고 각 클래스 마다 POJO 인스턴스/빈을 묶습니다. 그리고 클래스에 @Profile
    어노테이션을 붘이면 해당 프로파일에 편입이 됩니다. 예를 들면 @Profile("global") 또는 
    @Profile({"summer", "winter"}) 와 같이 적어주시면 됩니다.
    프로파일에 속한 빈을 애플리케이션에 로드하려면 일단 프로파일을 활성화 해야합니다.
    여러 프로파일을 로드할수도 있으며 자바 런타임 플래그나 WAR 파일 초기화 매개변수를 지정해
    프로그램 방식으로 로드할 수도 있습니다.
    다음은 프로그램 방식으로 로드하는 방식입니다.
```java
public class Main {
    public static void main(String[] args){
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext();
        context.getEvironment().setActiveProfiles("global", "winter");
        context.scan("package");
        context.refresh(); 
    }
}
```
    자바 런타임 플래그로 로드할 프로파일을 명시하는 방법도 있습니다.
    -Dspring.profiles.active=global,winter
    위에 것들을 기본 프로파일로 지정할때에는 setDefaultProfiles 메서드를
    spring.profiles.default 를 사용해주면 됩니다.
    
## 1.12 POJO 에게 IoC 컨네이너 리소스 알려주기
    컴포넌트가 IoC 컨테이너와 직접적인 의존 관계를 가지도록 설계하는 방법은 바람직하지 않지만
    때로는 빈에서 컨테이너 리소스를 인지해야 하는 경우도 있습니다. 이는 Awarw 인터체이스를 구현해야하며,
    스프링은 이 인터페이스를 구현한 빈 을 감지해 리소스를 세터 메서드로 주입합니다.
|Aware 인터페이스|대상 리소스 타입|
|-------------|------------|
|BeanNameAware|IoC 컨테이너에 구성한 인스턴스의 빈 이름|
|BeanFactoryAware|현재 빈 팩토리, 컨테이너 서비스를 호출하는데 사용|
|ApplicationContextAware|현재 어플리케이션 컨텍스트, 컨테이너 서비스를 호출하는데 사용|
|MessageSourceAware|메시지 소스, 텍스트 메시지를 해석하는데 사용|
|ApplicationEventPublisherAware|애플리케이션 이벤트 발행기, 애플리케이션 이벤트 발생하는데 사용|
|ResourceLoaderAware|리소스 로더, 외부 리소스를 로드하는데 사용|
|EnvironmentAware|Environment 인스턴스|
    Aware 인터페이스의 세터 메서드는 스프링이 빈 프로퍼티를 설정한 이후, 초기화 콜백 메서드를 호출하기
    잉전에 호출합니다.
    1. 생성자나 팩토리 메서드를 호출해 빈 인스턴스를 생성합니다
    2. 빈 프로퍼티에 값, 빈 레퍼런스를 설정합니다
    3. Aware 인터페이스에 정의한 세터 메서드를 호충합니다
    4. 빈 인스턴스를 각 빈 후처리기에 있는 postProcessBeforeInitialization() 메서드로 넘겨
    초기화 콜백 메서드를 호출합니다.
    5. 빈 인스턴스를 각 빈 후처리기 postProcessAfterInitialization() 메서드로 넘깁니다.
    이제 빈을 사용할 준비가 끝났습니다.
    6. 컨테이너가 종료되면 폐기 콜백 메서드를 호출합니다.
    
    만일 클래스의 POJO 인스턴스가 자신의 빈 이름을 인지하려면 다음과 같이 구성하면 됩니다.
```java
public class Class implements BeanNameAware {
    private String name;
    @Override
    public setBeanName(String beanName) {
        this.name = beanName;
    }
}
```

## 1.13 애너테이션을 활용해 애스펙트 지향 프로그래밍 하기
    aspect를 정의하려면 자바 클래스에 @Aspect를 붙이고 메서드별로 적절한 애너테이션을 붙여 어드바이스
    로 만듭니다. 어드바이스 애너테이션은 @Before, @After, @AfterReturning, @AfterThrowing,
    @Around 중 하나를 사용할수 있습니다.
    IoC 컨테이너에서 애스펙트 애너테이션 기능을 활성화 하려면 구성클래스에 @EnableAspectJAutoProxy
    를 붙입니다. 스프링은 인터페이스 기반의 JDK 동적 프록시를 생성하여 AOP를 적용합니다.
    인터페이스를 사용하지 못하거나, 설계상 사용하지 않을 경우 @EnableAspectJAutoProxy 에서
    proxyTargetClass 속성을 true로 설정해서 CGLIB를 사용하면 됩니다.
    애스펙트는 여러 타입과 객체에 공통 관심사(로킹, 트랜잭션 관리)를 모듈화한 자바 클래스로 @Aspect를
    붙여 표시합니다.
    
### 1.13.1 @Before 어드바이스
    Before 어드바이스는 특정 프로그램 실행 지점 이전의 공통 관심사를 처리하는 메서드로
    @Before를 붙이고 포인트컷 표현식을 애너테이션값으로 지정합니다.
```java
@Aspect
@Component
public class CalculatorLoggingAspect {
    private Log log = LogFactory.getLog(this.getClass());
    
    @Before("execution(* ArithmeticCalculator.add(..))")
    public void logBefore() {
        log.info("The method add() begins");
    }
}
```
    이 포인트컷 표현식은 ArithmeticCalculator 인터페이스의 add() 메서드 실행을 가리킵니다.
    앞부분의 * 는 모든 수정자(public, protected, private), 모든 반환형을 매치합을 의미합니다.
    인수목록의 .. 는 인수 개수가 몆 개라도 좋다는 뜻입니다.
    
### 1.13.2 @After 어드바이스
    After 어드바이스는 조인포인트가 끝나면 실행되는 메서드로 @After를 붙여 표시합니다.
    다음은 계산기 메서드가 끝날때마다 로그를 남기는 어드바이스 입니다.
```java
@Aspect
public class CalculatorLoggingAspect {
    @After("execution(* *.*(..))")
    public void logAfter(JoinPoint joinPoint) {
        log.info("The method " + joinPoint.getSignature().getName() + "() ends");
    }
}
```
    포인트컷으로 매치한 실행지점을 조인포인트라고 합니다 어드바이스가 현재 조인포인트의 세부에 액세스하려면
    JoinPoint형 인수를 어드바이스 메서드에 선언해야 합니다. 그러면 메서드명, 인수값 등 조인포인트 정보
    를 조회할 수 있습니다. 위 코드는 클래스명, 메서드명에 와일드 카드를 써서 모든 메서드에 포인트컷을
    적용한 예제 입니다.

### 1.13.3 AfterReturning 어드바이스
    After 어드바이스는 조인포인트 실행의 성공 여부와 상관없이 작동합니다. 만일 조인포인트가 값을
    반환할 경우에만 로깅하고 싶다면 @AfterReturning 로 대체하면 됩니다.
    다음은 조인포인트가 반환한 결과값을 가져오는 예제입니다
```java
@Aspect
public class CalculatorLoggingAspect {
    @AfterReturning(
        pointcut = "execution(* *.*(..))",
        returning = "result"
    )
    public void logAfter(JoinPoint joinPoint, Object result) {
        log.info("The method " + joinPoint.getSignature().getName() 
            + "() ends with" + result);
    }
}
```

### 1.13.4 AfterThrowing 어드바이스
    After Throwing 어드바이스는 조인포인트 실행 도중 예외가 날 경우에만 실행됩니다.
    작동 원리는 AfterReturning 와 동일합니다 발생한 예외는 throwing 속성에 담아 전달할 수 있습니다.
    특정한 예외만 처리하고 싶다면 그 타입을 인수로 선언해주면 됩니다.
    
### 1.13.5 Around 어드바이스
    이 어드바이스는 앞서 살펴본 어드바이스 모두 조합할 수 있습니다. 조인포인트 인수형은
    ProceedingJoinPoint로 고정돼 있습니다.
```java
@Aspect
@Coponent
public class CalculatorLoggingAspect {
    @Around("execution(* *.*(..))")
    public void logAround(ProceedingJoinPoint로 joinPoint) {
        log.info("The method {}{} begins with {}", joinPoint.getSignature().getName(),
            Arrays.toString(joinPoint.getArgs()));
        try {
            Object reslut = joinPoint.proceed();
            log.info("The method {}() ends with", joinPoint.getSignature().getName(),
                reslut);
            return reslut;
        } catch (IllegalArgumentException e) {
            log.error("Illegal argument {} in {}()", Arrays.toString(joinPoint.getArgs()),
                joinPoint.getSignature().getName());
            throw e;   
        }
    }
}
```

## 1.14 조인포인트 정보 가져오기
    어드바이스 메서드의 시그니처에 joinPoint형 인수를 선언하면 정보를 얻을수 있습니다.
    프록시로 감싼 원본 빈은 Target 객체라고 하며 프록시 객체는 This로 참조합니다.
```java
@Aspect
@Compoent
public class CalculatorLoggingAspect {
    private Logger log = LoggerFactory.getLogger(this.getClass());
    @Before("execution(* *.*(..))")
    public void logJoinPoint(JoinPoint joinPoint) {
        log.info(joinPoint.getKind());
        log.info(joinPoint.getSignature().getDeclaringTypeName());
        log.info(joinPoint.getSignature().getName());
        log.info(joinPoint.getArgs());
        log.info(joinPoint.getTarget().getClass().getName());
        log.info(joinPoint.getThis().getClass().getName());        
    }
}
```

## 1.15 @Order로 애스펙트 우선순위 설정하기
    애스펙트 간 우선순위는 Ordered 인터페이스를 구현하거나 @Order 애너테이션을 붙여 지정합니다.
    Ordered 인터페이스를 구현할 경우 getOrder() 메서드가 반환하는 값이 작을수록 우선순위가 높습니다.
    @Order을 사용하는 경우 다음과 같이 구현하면 됩니다. @Order(0)

## 1.16 애스펙트 포인트컷 재사용하기
    @PuintCut을 이용하면 포인트컷만 따로 정의해 여러 어드바이스에서 재사용할수 있습니다.
```java
@Aspect
public class CalculatorPointcuts {
    @Pointcut("execution(* *.*(..))")
    public void loggingOperation() {}
}

@Aspect
public class CalculatorLoggingAspect {
    @Aroud("CalculatorPointcuts.loggingOperation")
    public Object logAround(ProceedingJoinPoint joinPoint) throws Throwable {}
}
```

## 1.17

## 1.24 POJO끼리 애플리케이션 이벤트 주고받기
    POJO들이 서로 통신할때는 대부분 송신기가 수신기를 찾아 그 메서드를 호출합니다. 이 구조는 단순하지만
    양측 POJO가 서로 단단히 결합할 수밖에 없습니다.
    IoC 컨테이너에서는 POJO 구현체가 아닌 인터페이스를 사용해 소통하므로 결합도를 낮출수 있습니다.
    그러나 여러 수신기와 통잉할 경우에는 일일이 하나씩 호출해야 합니다
    스프링 애플레키에션 컨텍스트는 빈 간의 이벤트 기반 통신을 지원합니다. 이벤트 기반 통신 모델에서는
    실제로 수신기가 여럿 존재할 가능성이 있기 때문에 송신기는 누가 수신할지 모른채 발행합니다.
    수신기 역시 누가 이벤트를 발행했는지 알 필요없이 리스닝합니다.
    
    예전에는 이벤트를 리스닝하려면 ApplicationListener 인터페이스를 구현하고 알림받고 싶은
    이벤트형을 (ApplicationListener<CheckoutEvent>) 타입 매개변수로 지정하여 구현했습니다.
    이런 유형의 리스너는 ApplicationListener 인터페이스에 타입 시그니처로 명시된
    ApplicationEvent를 상속한 이벤트만 리스닝할 수 있습니다.
    
    이벤트를 발행하려면 빈에서 ApplicationEventPublisher를 가져와야 하고 이벤트를 전송하려면
    이벤트에서 publishEvent() 메서드를 호출해야합니다.
    
    이벤트 기반 통신을 하려면 제일 먼저 이벤트 자체를 정의해야합니다.
```java
public class CheckoutEvent extends ApplicationEvent {
    public CheckoutEvent() {
        super();
    }
}
```
    이벤트를 인스턴스화한 다음 애플리케이션 이벤트 발행기에서 publishEvent() 메서드를 호출하면
    이벤트가 발행됩니다.
```java
public class Cashier {
    @Autowored
    private ApplicationEventPublisher applicationEventPublisher;
    
    public void checkout(){
        CheckEvent event = new CheckEvnet();
        applicationEventPublisher.publishEvent(event);
    }
}
```
    ApplicationListener 인터페이스를 구현한 애플리케이션 컨텍스트에 정의된 빈은
    타입 매개 변수에 매치되는 이벤트를 모두 알림 받습니다.
```java
@Component
public class CheckoutListener implements ApplicationListener<CheckoutEvent> {
    @Override
    public void onApplicationEvent(CheckoutEvent event) {
        
    }
}
```
    스프링 4.2 부터는 인터페이스 없이 @EventListener 를 붙여도 됩니다.
    
# 2. 스프링 MVC
## 2.0 개요
    MVC(모델-뷰-컨트롤러)는 아주 일반적인 UI디자인 패턴입니다.
    모델은 뷰에서 보여줄 애플리케이션 데이터를 담고 뷰는 일체의 비지니스 로직없이 데이터를 보여줍니다.
    컨트롤러는 유저의 요청을 받아 업무를 처리하는 서비스를 호출하고, 서비스가 업무가 끝나면 다시 컨트롤러로
    데이터를 반환합니다. 그 후 이 데이터를 취합해서 뷰에 표시할 모델을 준비합니다. 즉, UI와 비지니스 로직을
    분리해서 서로 독립적으로 수정하는게 핵심입니다.
    스프링 MVC 애플리케이션에서 도메인 객체 모델은 서비스 레이어에서 처리되고 퍼시스턴스 레이어에서 저장됩니디.
    
## 2.1 간다한 스프링 MVC 웹 애플리케이션 개발하기
    프론트 컨트롤러는 스프링 MVC의 중심 컴포넌트 입니다. 보통 디스패쳐 서블릿이라고 일컫는 스프링 MVC 컨트롤러
    는 코어 자바 EE 디자인 패턴 중 하나인 프론트 컨트롤러 패턴을 구현한 것으로 모든 웹 요청은 반드시
    디스패처 서블릿을 거쳐 처리됩니다.
    
    스프링 컨트롤러 클래스에 @Controller or @RestController 을 붙이면
    컨트롤러에 요청이 들어오면 적합한 핸들러 메서드를 찾습니다. 이때 @RequestMapping 을 통해
    핸들러 메서드로 등록합니다.
    다음은 @RequestMapping 의 올바른 인수형 입니다.
1. HttpServletRequest or HttpServletResponse 
2. 임의형 요청 매개변수 (@RequestParam 을 붙입니다)
3. 임의형 모델 속성 (@ModelAttribute 를 붙입니다)
4. 요청 내에 포함된 쿠키값 (@CookieValue 를 붙입니다)
5. 핸들러 메서드가 모델에 속성을 추가하기 위해 사용하는 Map or ModelMap
6. 핸들러 메서드가 객체 바인딩/유효성을 검증한 결과를 가져올 때 필요한 Errors or BindingResult
7. 핸들러 메서드가 세션 처리를 완료했음을 알릴 때 사용하는 SessionStatus


    컨트롤러는 적절한 핸들러 메서드를 선택하고 서비스에 요청 처리를 위임합니다. 요청 처리후 제어권을 뷰로 넘기는데
    ViewResolver 인터페이스를 구현한 뷰 리졸버로 위임되는데, 컨트롤러 반환값을 받아 실제 컨트롤러의 반환 값을
    실제 뷰 구현체로 해석합니다. 그 후 각 뷰의 로직에 따라 핸들러 메서드가 전달한 인수형들을 렌더링 합니다.
    
    
    




























