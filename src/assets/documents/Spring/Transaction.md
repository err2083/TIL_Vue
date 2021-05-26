# 10. 스프링 트랜잭션 관리

***이 글은 스프링5 레시피 을 참고해서 쓴 글입니다.***

## 10.0 개요

트랜잭션 관리는 엔터프라이즈 애플리케이션에서 데이터 무결성과 일관성을 보장하는 데 필수 기법이다. 스프링은 다양한 트랜잭션 관리 API를 상위 레벨에서 추상화하여 제공해준다.

프로그램 방식의 트랜잭션 관리는 비지니스 메서드 중간에 트랜잭션 관리 코드를 삽입하여, 메서드가 정상 종료하면 커밋하고 예외가 발생하면 롤백한다. 하지만 일일일 트랜잭션을 제어하면 같은 코드가 반복되어 공통의 관심사라는 것을 알 수 있다.

선언적 트랜잭션 관리는 선언을 사용해 트랜잭션 관리 코드를 비즈니스 메서드와 떼어놓는 것으로, 스프링은 AOP 를 사용해 선언적 트랜잭션 관리를 지원해준다.

프로그램 방식의 트랜잭션 관리는 직접 코드를 명시하는 형태로 트랜잭션을 시작, 커밋, 병합할 수 있고 여러 속성값을 지정하면 아주 정교한 제어도 가능하다. 스프링은 전달 방식, 격리 수준, 롤백 규칙, 트랜잭션 타입아웃, 읽기 전용 트랜잭션 여부 등 다양한 속성을 지원하므로 원하는 트랜잭션 로직을 커스터마이징할 수 있다.

스프링 프록시를 추가하면 성능에 문제가 생길 수 있다고 여겨지다면, 네이티브 트랜잭션에 직접 접근해 수동으로 트랜잭션을 제어하고, 트랜잭션 경계가 시작 및 커밋되는 주변에 템플릿 메서드를 제공하는  TransactionTemplate 쿨래스를 이용해 스프링 프록시의 오버헤드를 방지할 수 있다.

## 10.1 트랜잭션 관리의 중요성

트랜잭션 관리는 엔터프라이즈 애플리케이션에서 데이터 무결성과 일관성을 보장하는 필수 기법이다. 동시성, 분산 환경에서는 예기치 않은 에러가 발생 시 데이터를 복원해야하므로 트랜잭션 관리는 매우 중요하다.

트랜잭션이란 쉽게 말해 연속된 여러 액션을 한 단위의 작업으로 뭉뚱그린 걸로, 이 액션 뭉치는 전체가 완전히 끝나던지, 아무런 영향도 끼지지 않아야 합니다. 즉, 모든 액션이 제대로 끝나면 영구 커밋되고, 하나라도 잘못되면 아무 일도 없었던 것처럼 초기상태로 롤백 됩니다.

트랜잭션의 속성은 ACID(원자성, 일관성, 격리성, 지속성)로 설명하는데,

* 원자성(Atomicity): 트랜잭션은 연속적인 액션들로 이루어진 원자성 작업으로, 트랜잭션의 액션은 전부 다 수행되거나 아무것도 수행되지 않다록 보장합니다.
* 일관성(Consistency): 트랜잭션의 액션이 모두 완료되면 커밋되고 데이터 및 리소스는 비즈니스 규칙에 맞게 일관된 상태를 유지합니다.
* 격리성(Isolation): 동일한 데이터를 여러 트랜잭션이 동시에 처리하는 경우 데이터가 변질되지 않게 하려면 각각의 트랜잭션을 격리해야 합니다.
* 지속성(Durability): 트랜잭션 완료 후 그 결과는 시스템이 실패(커밋도중 정전)하더라도 살아남아야 합니다. 보통 트랜잭션 결과물은 퍼시스턴스 저장소에 씌어집니다.

지금부터 온라인 서점 애플리케이션을 예로 들어보자.

![10.1](../../img/Spring/Transaction/10-1.png) 그림 10-1 온라인 서점 애플리케이션 ERD

트랜잭션의 본질을 보기위해 스프링 JDBC 기능 없이 보자.

```java
public class JdbcBookShop implements BookShop {
    private DataSource dataSource;

    @Override
    public void purchase(String isbn, String username) {
        Connection conn = null;
        try {
            conn = dataSource.getConnection();

            PreparedStatement stmt1 = conn.prepareStatement("SELECT PRICE FROM BOOK WHERE ISBN + ?");
            stmt1.setString(1, isbn);
            ResultSet rs = stmt1.executeQuery();
            rs.next();
            int price = rs.getInt("PRICE");
            stmt1.close();

            PreparedStatement stmt2 = conn.prepareStatement("UPDATE BOOK_STOCK SET STOCK + STOCK - 1" + "WHERE ISBN = ?");
            stmt2.setString(1, isbn);
            stmt2.executeUpdate();
            stmt2.close();

            PreparedStatement stmt3 = conn.prepareStatement("UPDATE ACCOUNT SET BALANCE + BALANCE - ?" + "WHERE USERNAME = ?");
            stmt3.setInt(1, price);
            stmt3.setString(2, username);
            stmt3.executeUpdate();
            stmt3.close();
        } catch (SQLException e) {
            throw new RuntimeException(e);
        } finally {
            if (conn != null) {
                try {
                    conn.close();
                } catch (SQLException) {}
            }
        }
    }
}
```

purchase() 메서드는 도서 단가를 조회하는 쿼리, 도서 재고 및 계정 잔고를 수정하는 쿼리 하나씩 모두 3개의 쿼리를 수행한다.

그럼 트랜잭션 관리를 안할때 어떻게 되는지 확인해보자

|ISNB|BOOK_NAME|PRICE|
|---|---|---|
|0001|The First Book|30|

|ISNB|STOCK|
|---|---|
|0001|10|

|USERNAME|BALANCE|
|---|---|
|user1|20|

user1 이 ISNB 0001 도서를 구입한다고 가정하고 Main 클래스를 작성하면 user1은 잔고가 20달라밖에 없어서 도서를 구입할 수 없다.

```java
public class Main {
    public static void main(String[] args) throws Throwable {
        ApplicationContext context = new AnnotationConfigApplicationContext(BookstoreConfiguration.class);

        BookShop bookshop = context.getBean(BookShop.class);
        bookShop.purchase("0001", "user1");
    }
}
```

이 클래스를 실행하면 ACCOUNT 테이블에 설정된 제약조건에 의해 SQLException이 발생합니다. 하지만 BOOK_STORE 테이블을 확인하면 이 유저가 구매를 하지 못했는데도 재고가 하나 줄었을 것이다. 이는 세 번째 SQL문을 실행하면서 예외가 발생하기 전, 이미 두 번째 SQL문이 실행되어 재고가 차감되었기 때문이다.

이처럼 트랜잭션을 제대로 관리하지 않으면 데이터가 꼬여버립니다. purchase() 메서드는 하나의 트랜잭션으로 실행해야하며, 하나라도 실패했을시 모두 롤백되어야 한다.

### 10.1.1 JDBC 커밋/롤백을 이용해 트랜잭션 관리하기

JDBC를 사용해 DB를 수정하면 실행이 끝난 SQL문은 바로 커밋되는 게 기본 동작입니다. 하지만 자동커밋하면 원하는 작업에 트랜잭션을 걸 수가 없으므로 기본 설정된 자동커밋을 끄고, 명시적으로 commit(), rollback() 매서드를 호출해야합니다.

```java
public class JdbcBookShop implements BookShop {
    public void purchase(String isbn, String username) {
        Connection conn = null;
        try {
            conn = dataSource.getConnection();
            conn.setAutoCommit(false);
            // ...
            conn.commit();
        } catch (SQLExcetpion e) {
            if (conn != null) {
                try {
                    conn.rollback();
                } catch (SQLException e) {}
            }
        } finally {
            if (conn != null) {
                try {
                    conn.close();
                } catch (SQLException e) {}
            }
        }
    }
}
```

그런데 이렇게 JDBC 접속을 분명하게 커밋/롤백해서 트랜잭션을 관리하는 방법은 메서드마다 판박이 코드가 지겹게 반복되는 모양새라 바람직하지 않고, JDBC에 종속되므로 나중에 데이터 액세스 기술을 변경하면 전체 코드를 변경해야하는 문제가 있습니다. 다행이 스프링은 간편하게 트랜잭션 관리 작업을 할 수 있도록 PlatformTransactionManager, TransactionTemplate, 트랜잭션 선언 등 지원합니다.

## 10.2 트랜잭션 관리자 구현체 선정하기

> 과제

데이터 소스가 하나뿐인 애플리케이션은 하나의 DB접속에 대해 commit(), rollback() 메소드를 호출하면 트랜잭션을 관리할수 있지만, 트랜잭션을 관리할 데이터 소스가 여럿이거나 자바 EE 애플리케이션 서버에 내장된 트랜잭션 관리 기능을 사용할 경우 Java Transaction API 사용을 고려해야합니다. JPA 같은 ORM 프레임워크마다 상이한 트랜잭션 API를 호출하는 경우도 있습니다. 이렇게 기술이 달라지만 트랜잭션 API도 달리 해야 하지만 다른 API로 전환하는 일이 녹록치 않다.

> 해결책

스프링은 여러 트랜잭션 관리 API 중에서 범용적인 트랜잭션 기능을 추상화했습니다. 덕분에 개발자는 하부 트랜잭션 API를 자세히 몰라도 스프링이 제공하는 트랜잭션 편의 기능을 이용할 수 있고, 특정 트랜잭션 기술에 구애받지 않아도 됩니다.

PlatformTransactionManager는 기술 독립적인 트랜잭션 관리 메서드를 캡슐화한 스랜잭션 관리 추상화의 핵심 인터페이스 입니다. 이 트랜잭션은 다음 세 작업 메서드를 제동해줍니다.

* TransactionStatus getTransaction(TransactionDefinition definition) throws TransactionException
* void commit(TransactionStatus status) throws TransactionException
* void rollback(TransactionStatus status) throws TransactionException

> 풀이

PlatformTransactionManager는 전체 스프링 트랜잭션 관리자를 포괄한 인터페이스오, 스프링에는 여러 가지 트랜잭션 관리 API에 적용 가능한, 이 인터페이스의 기본 구현체가 이미 탑재되어 있습니다.

하나의 데이터 소스를 JDBC로 액세스하는 애플리케이션은 DataSourceTransactionManager 정도면 충분합니다.

* 자바 EE 애플리케이션 서버에서 JTA로 트랜잭션을 관리할 경우, 서버에서 트랜잭션을 탐색하려면 JtaTransactionManager를 사용해야 합니다. 분산 트랜잭션(여러 리소스에 걸친 트랜잭션)을 구현할 때에도 JtaTransactionManager가 제격입니다. 대부분 JTA 트랜잭션 관리자를 이용해 애플리케이션 서버의 트랜잭션 관리자를 연계하지만 Atomikos 같은 단독형 JTA 트랜잭션 관리자도 얼마든지 이용 가능합니다.
* ORM 프레임워크로 DB에 액세스할 경우 HibernateTransactionManager나 JpaTransactionManager 등의 해당 프레임워크 트랜잭션 관리자를 선택합니다.

![10.2](../../img/Spring/Transaction/10-2.png) 그림 10-2 자주 쓰이는 PlatformTransactionManager 인터페이스 구현체

트랜잭션 관리자는 IoC 컨테이너에 일반 빈으로 선언합니다. 다음은 DataSourceTransactionManager 인스턴스를 빈으로 선언합니다. 다음은 DataSourceTransactionManager 인스턴스를 빈으로 구성한 코드입니다. 반드시 트랜잭션 관리에 필요한 dataSource 프로퍼티를 설정해야 이 데이터 소스로 접속된 트랜잭션을 관리할 수 있습니다.

```java
@Bean
public DataSourceTransactionManager transactionManager() {
    DataSourceTransactionManager transactionManager = new DataSourceTransactionManager();
    transactionManager.setDataSource(dataSource());
    return transactionManager;
}
```

## 10.3 트랜잭션 관리자 API를 이용해 프로그램 방식으로 트랜잭션 관리하기

> 과제

비즈니스 메서드에서 트랜잭션을 커밋/롤백하는 시점은 정교하게 제어해야 하나 하부 트랜잭션 API를 직접 다루고 싶지는 않습니다.

> 해결책

스프링 트랜잭션 관리자는 getTransaction() 메서드로 새 트랜잭션을 시작하고 commit(), rollback() 메서드로 트랜잭션을 관리하는, 기술 독립적인 API를 제공합니다. PlatformTransactionManager는 트랜잭션 관리를 추상화한 인터페이스라서 어떤 기술로 구현하든 잘 동작합니다.

> 해결책

```java
public class TransactionalJdbcBookShop extends JdbcDaoSupport implements BookShop {
    private PlatformTransactionManager transactionManager;

    public void setTransactionManager(PlatformTransactionManager transactionManager) {
        this.transactionManager = transactionManager;
    }

    @Override
    public void purchase(String isbn, String username) {
        TransactionDefinition def = new DefaultTransactionDefinition();
        TransactionStatus = transactionManager.getTransaction(def);

        try {
            int price = getJdbcTemplate().queryForObject("SELECT PRICE FROM BOOK WHERE ISBN = ?", Integer.class, isbn);

            getJdbcTemplate().update("UPDATE BOOK_STOCK SET STOCK = STOCK -1 WHERE ISBN = ?", isbn);

            getJdbcTemplate().update("UPDATE ACCOUNT SET BALANCE = BALANCE - ? WHERE USERNAME = ?", price, username);

            transactionManager.commit(status);
        } catch (DataAccessException e) {
            transactionManager.rollback(status);
            throw e;
        }
    }
}
```

새 트랜잭션을 시작하기 전에 TransactionDefinition형 트랜잭션 정의 객체에 속성을 설정합니다. 트랜잭션 정의 객체를 getTransaction() 메서드의 인수로 넣고 호출하여 트랜잭션 관리자에게 새 트랜잭션을 시작할 것을 요구합니다. 그러면 트랜잭션 관리자는 트랜잭션 상태 추적용 TransactionStatus 객체를 반환하고 SQL문이 모두 정상 실행되면 이 트랜잭션 상태를 넘겨 트랜잭션을 커밋하라고 트랜잭션 관리자에게 알립니다. 또 스프링 JDBC 템플릿에서 발생한 예외는 모두 DataAccessException 하위형 이므로 이런 종류의 예외가 나면 롤백하도록 설정합니다.

이 클래스의 트랜잭션 관리자 프로퍼티(transactionManager)는 일반형 PlatformTransactionManager로 선언했기 때문에 적절한 트랜잭션 관리자 구현체가 필요합니다. 이 예제는 하나의 데이터 소스로 JDBC를 사용해 액세스하는 경우이므로 DataSourceTransactionManager 가 적당합니다. 이 클래스는 JdbcDaoSupport의 하위 클래스라서 Source 객체도 연결해야 합니다.

```java
@Configuration
public class BookstoreConfiguration {
    @Bean
    public DataSourceTransactionManager transactionManager() {
        DataSourceTransactionManager transactionManager = new DataSourceTransactionManager();
        transactionManager.setDataSource(dataSource());
        return transactionManager;
    }

    @Bean
    public BookShop bookShop() {
        TransactionalJdbcBookShop bookShop = new TransactionalJdbcBookShop();
        bookShop.setDataSource(dataSource());
        bookShop.setTransactionManager(transactionManager());
        return bookShop;
    }
}
```

## 10.4 트랜잭션 템플릿을 이용해 프로그램 방식으로 트랜잭션 관리하기

> 과제

전체가 아닌 하나의 코드 블록에서 다음과 같은 트랜잭션 요건을 적용해야 하는 비즈니스 메서드가 있다고 합시다.

* 블록 시작 지점에서 트랜잭션을 새로 시작합니다.
* 정상 실행되면 트랜잭션을 커밋합니다.
* 예외가 발생하면 트랜잭션을 롤백합니다.

스프링 트랜잭션 관리자 API를 직접호출하면 트랜잭션 관리 코드는 구현 기술과 독립적으로 일반화할수 없습니다. 또 비슷한 코드 블록마다 판박이 코드를 반복하고 싶은 개발자도 없습니다.

> 해결책

스프링은 JDBC 템플릿과 유사한 트랜잭션 템플릿을 제공함으로써 전체 트랜잭션 관리 프로세스 및 예외 처리를 효과적으로 제어할 수 있게 지원합니다. TransactionCallback|&lt;T&gt; 인터페이스를 구현한 콜백 클래스에서 코드 블록을 캡슐화한 뒤 TransactionTemplate의 execute() 메서드에 전달하면 됩니다. 더 이상 트랜잭션을 관리하는 반복적인 코드는 없어도 됩니다. 스프링에 내장된 템플릿은 가벼운 객체여서 성능에 영향을 미치지 않으며 간단히 재생성/폐기할 수 있습니다. JDBC 템플릿을 간단히 DataSource를 참조해서 재생성할 수 있는 것처럼, TransactionTemplate도 트랜잭션 관리자를 참조할 수 있으면 얼마든지 다시 만들 수 있습니다. 물론, 스프링 애플리케이션 컨텍스트에 생성해도 됩니다.

> 풀이

데이터 소스가 있어야 JDBC 템플릿을 생성할 수 있듯 TransactionTemplate도 트랜잭션 관리자가 있어야 만들 수 있습니다. 트랜잭션 템플릿은 트랜잭션이 적용될 코드 블록을 캡슐화한 트랜잭션 콜백 객체를 실행합니다. 콜백 인터페치스는 별도 클래스 또는 내부 클래스 형태로 구현하는데. 내부 클래스로 구현할 경우에는 메서드 인수 앞에 final을 선언해야 합니다.

```java
public class TransactionalJdbcBookShop extends JdbcDaoSupport implements BookShop {
    @Setter
    private PlatformTransactionManager transactionManager;

    @Override
    public void purchase(final String isbn, final String username) {
        TransactionTemplate transactionTemplate = new TransactionTemplate(transactionManager);

        transactionTemplate.execute(new TransactionCallbackWithoutResult() {
            protected void doInTransactionWithoutResult(TransactionStatus status) {
                int price = getJdbcTemplate().queryForObject("SELECT PRICE FROM BOOK WHERE ISBN = ?", Integer.class, isbn);

                getJdbcTemplate().update("UPDATE BOOK_STOCK SET STOCK = STOCK -1 WHERE ISBN = ?", isbn);

                getJdbcTemplate().update("UPDATE ACCOUNT SET BALANCE = BALANCE - ? WHERE USERNAME = ?", price, username);
            }
        });
    }
}
```

TransactionTemplate은 TransactionCallback&lt;T&gt; 인터페이스를 구현한 트랜잭션 콜백 객체, 또는 이 인터페이스를 구현한 프레임워크 내장 객체 TransactionCallbackWithoutResult를 받습니다. 도서 재고 및 계정 잔고를 차감하는 purchase() 메서드는 반환값이 없으므로 TransactionCallbackWithoutResult 정도로 충분합니다. 어떤 값을 반환하는 코드 블록은 반드시 TransactionCallback&lt;T&gt; 인터페이스를 구현해야  하며 콜백 객체의 반환값은 템플릿에 있는 T execute() 메서드가 반환합니다. 트랜잭션을 직접 시작, 커밋/롤백해야 하는 부담에서 벗아난 것이 가장 큰 보람입니다.

콜백 객체를 실행하다가 언체크 예외(RuntimeException, DataAccessException)가 발생하거나 명시적으로 doInTransactionWithoutResult() 메서드의 TransactionStatus 인수에 대해 setRollbackOnly() 메서드를 호출하면 트랜잭션이 롤백됩니다. 그밖에는 콜백 객체 실행이 끝나자마자 트랜잭션이 커밋됩니다.

트랜잭션 템플릿을 직접 생성하지 말고 IoC 컨테이너가 대신 만들게 구성해도 됩니다.

```java
public class TransactionalJdbcBookShop extends JdbcDaoSupport implements BookShop {
    @Setter
    private TransactionTemplate transactionTemplate;
}
```

트랜잭션 템플릿은 스레드-안전한 객체여서 트랜잭션이 적용된 여러 빈에 두루 사용됩니다.

## 10.5 @Transactional을 붙여 선언적으로 트랜잭션 관리하기

> 과제

빈 구성 파일에 트랜잭션을 선언하려면 포인트컷, 어드바이스, 어드바이저 같은 AOP 지식이 필수입니다.

> 해결책

스프링에서는 각각 트랜잭션을 적용할 메서드에 @Transactional, 구성 클래스에는 @EnableTransactionManagement을 붙여 트랜잭션을 선언합니다.

> 풀이

메서드에 @Transactional만 붙이면 트랜잭션이 걸린 메서드로 선언됩니다. 주의할 점은 스프링 AOP가 프록시 기반으로 움직이는 한계 때문에 public 메서드에만 이런 방법이 통한다는 사실입니다.

_프록시를 사용해 @Transactional 메서드를 가져와 실행해야 하는데 private, protected 등 public 이외의 접근자를 붙이면 가져올 수가 없기 때문에 에러는 나지 않지만 조용히 무시됩니다._

```java
public class JdbcBookShop extends JdbcDaoSupport implements BookShop {

    @Transactional
    public void purchase(final String isbn, final String username) {
        int price = getJdbcTemplate().queryForObject("SELECT PRICE FROM BOOK WHERE ISBN = ?", Integer.class, isbn);

        getJdbcTemplate().update("UPDATE BOOK_STOCK SET STOCK = STOCK -1 WHERE ISBN = ?", isbn);

        getJdbcTemplate().update("UPDATE ACCOUNT SET BALANCE = BALANCE - ? WHERE USERNAME = ?", price, username);
    }
}
```

@Transactional은 메서드/클래스 레벨에 적용 가능한 애너테이션입니다. 클래스에 적용하려면 그 클래스의 모든 public 메서드에 트랜잭션이 걸립니다. 인터페이스도 클래스/메서드 레벨에 @Transactional을 붙일 순 있지만 클래스 기반 프록시(CGLIB 프록시)에서는 제대로 작동하지 않을 수 있으니 권장하지 않습니다.

자바 구성 클래스에는 @EnableTransactionManagement 하나만 붙이면 됩니다. 스프링은 IoC 컨테이너에 선언된 빈들을 찾아 @Transactional을 붙인 메서드 중에서 public 메서드를 가져와 어드바이스를 적용합니다. 이런 과정을 거쳐 스프링에서 트랜잭션을 관리할 수 있습니다.

```java
@Configuration
@EnableTransactionManagement
public class BookstoreConfiguration {}
```

## 10.6 트랜잭션 전당 속성 설정하기

> 과제

트랜잭션이 걸린 메서드를 다른 메서드가 호출할 경우엔 트랜잭션을 어떠헤 전달할지 지정할 필요가 있습니다. 이를테면 호출한 메서드 역시 기존 트랜잭션 내에서 실행하거나, 트랜잭션을 하나 더 생성해 자신만의 고유한 트랜잭션에서 실행하거나 해야겠죠.

> 해결책

트랜잭션 전달 방식은 propagation 트랜잭션 속서에 명시합니다. org.springframework.transaction.TransactionDefinition 인터ㅔ이스에는 모두 일곱 가지 전달 방식이 정의되어 있습니다. 모든 트랜잭션 관리자가 모두 지원하는 건 아니고, 하부 이소스에 따라 달라질 수도 있습니다. 가령 트랜잭션 관리자가 다양한 전달 방식을 지원한다 해도 DB가 지원하는 겨리 수준에 따라 영향을 받을 수밖에 없습니다.

|전달 속성|설명|
|------|-------------------|
|REQUIRED|진행 중인 트랜잭션이 있으면 현재 메서드를 그 트랜잭션에서 실행화되, 없으면 새 트랜잭션을 시작해서 실행합니다.
|REQUIRES_NEW|항상 새 트랜잭션을 시작해 현재 메서드를 실행하고 진행 중인 트랜잭션이 있으면 잠시 중단시킵니다.|
|SUPPORTS|진행 중인 트랜잭션이 있으면 현재 메서드를 그 트랜잭션 내에서 실행하되, 그렇지 않을 경우 트랜잭션 없이 실행합니다.|
|NOT_SUPPORTED|트랜잭션 없이 현재 메서드를 실행하고 진행 중인 트랜잭션이 있으면 잠시 중단시킵니다.|
|NEVER|반드시 트랜잭션 없이 현재 메서드를 실행하되 진행 중인 트랜잭션이 있으면 예외를 던집니다.|
|NESTED|진행 중인 트랜잭션이 있으면 현재 메서드를 이 트랜잭션의 중첩 트랜잭션 내에서 실행합니다. 진행 중인 트랜잭션이 없으면 새 트랜잭션응 시작해서 실행합니다. 이 방식은 스프링에서만 가능한데. 장시간 싱행되는 업무를 처리하면서 배치 실행 도중 끊어서 커밋하는 경우 유용합니다. 이를테면 일정 갯수 레코드당 한번씩 커밋하는 경우, 중간에 일이 잘못되어도 중첩 트랜잭션을 롤백하면 전체가 아닌 일정 갯수 레코드만 롤백됩니다.|

> 풀이

트랜잭션이 걸린 메서드를 다른 메서드가 호출하면 트랜잭션 전달이 일어납니다.
예를 들어, 서점 고객이 계산대에서 체크아웃하는 상황을 가정하면, 먼저 Cashier(계산대) 인터페이스를 다음과 같이 정의합니다. 이 인터페이스는 구매 작업을 bookshop 빈에 넘겨 purchase() 메서드를 여러 번 호출하는 식으로 구현할 수 있습니다. 당연히 checkout() 메서드엔 @Transactional을 붙여 트랜잭션을 걸어야 합니다.

```java
public interface Cashier {
    public void checkout(List<String> isbns, String username);
}

public class BookShopCashier implements Cashier {
    @Setter
    private BookShop bookShop;

    @Override
    @Transactional
    public void checkout(List<String> isbns, String username) {
        for (String isbn : isbns) {
            bookShop.purchase(isbn, username);
        }
    }
}
```

서점 DB에 테스트 데이터를 입력해서 트랜잭션 전달 과정을 살펴봅시다

|ISBN|BOOK_NAME|PRICE|
|---|---|---|
|0001|The First Book|30|
|0002|The Second Book|50|

|ISBN|STOCK|
|---|---|
|0001|10|
|0002|10|

|USERNAME|BALANCE|
|---|---|
|user1|40|

### REQUIRED 전달 속성

user1 유저가 도서 2권을 계산대에서 체크아웃할 때 이 유저의 잔고 사정상 첫 번째 도서는 구매할 수 있지만 두 번째 도서는 구매하기 부족하다고 합시다.

```java
public class Main {
    public static void main(String[] args) {
        Cashier cashier = context.getBean(Cashier.class);
        List<String> isbnList = Arrays.asList(new String[] {"0001","0002"});
        cashier.checkout(isbnList, "user1");
    }
}
```

bookshop 빈의 purchase() 메서드를 checkout() 처럼 다른 트랜잭션이 걸려 있는 메서드가 호출하면 기존 트랜잭션에서 실행하는 것이 기본인데, 이것이 기본 전달 방식인 REQUIRED의 로직입니다. 즉 checkout() 메서드의 시작, 종료 지점을 경계로 그 안에선 오직  하나의 트랜잭션만 존재하다가 메서드가 끝나면 커밋됩니다. 결국 user1 유저는 도서를 한 권도 구입하지 못합니다.

![10.3](../../img/Spring/Transaction/10-3.png) 그림 10-3 REQUIRED 트랜잭션 전달 속성

purchase() 메서드를 호출한 메서드가 @Transactional 메서드가 아니라서 적용된 트랜잭션이 없다면 새 트랜잭션을 만들어 시작하고 그 트랜잭션으로 메서드를 실행합니다. 트랜잭션 전달 방식은 @Transactional의 propagation 속성에 지정합니다. REQUIRED는 기본 전달 방식이라서 굳이 명시하지 않아도 됩니다.

```java
public class JdbcBookShop extends JdbcDaoSupport implements BookShop {
    @Transactional(propagation = Propagation.REQUIRED)
    public void purchase(String isbn, String username) {
        // ...
    }
}
```

### REQUIRES_NEW 전달 속성

무조건 트랜잭션을 새로 시작해 그 트랜잭션 안에서 메서드를 실행시키는 REQUIRES_NEW도 자주 쓰이는 전달 방식입니다. 진행 중인 트랜잭션이 있으면 잠깐 중단시킵니다. 따라서 BookShopCashier의 checkout() 메서드는 REQUIRED 방식으로 전달합니다.

```java
public class JdbcBookShop extends JdbcDaoSupport implements BookShop {
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void purchase(String isbn, String username) {
        // ...
    }
}
```

여기서는 모두 세 차례 트랜잭션이 시작됩니다. 첫 번째 트랜잭션은 checkout() 메서드에서 시작하지만 이 메서드가 첫 번째 purchase() 메서드를 호출하면 첫 번째 트랜잭션은 잠시 중단되고 새 트랜잭션이 시작됩니다. 새 트랜잭션은 첫 번째 purchase() 메서드가 끝나면 커밋됩니다. 두 번째 purchase() 메서드가 호출되면 또 다른 새 트랜잭션이 시작되지만 이 트랜잭션은 결국 실패하면서 롤백됩니다. 결국 첫 번째 도서는 구매 처리되지만 두 번째 도서는 도중에 실패합니다.

![10.4](../../img/Spring/Transaction/10-4.png) 그림 10-4 REQUIRES_NEW 전달 방식의 처리 로직

## 10.7 트랜잭션 격리 속성 설정하기

> 과제

동일한 애플리케이션 또는 상이한 애플리케이션에서 여러 트랜잭션이 동시에 같은 데이터를 대상으로 작업을 수행하면 어떤 일이 일어날지 예측하기 어렵습니다. 이럴 때엔 여러 트랜잭션이 다른 트랜잭션과 어떻게 격리되어야 하는지 분명히 지정해야 합니다.

> 해결책

두 트랜잭션 T1, T2가 있을 때 동시성 트랜잭션으로 발생할 수 있는 문제는 네 가지로 분류됩니다.

* 오염된 값 읽기(Dirty read): T2가 수정 후 커밋하지 않은 필드를 T1이 읽는 상황에서 나중에 T2가 롤백되면 T1이 읽은 필드는 일시적인 값으로 더 이상 유효하지 않습니다.
* 재현 불가한 읽기(Nonrepeatable read): 어떤 필드를 T1이 읽은 후 T2가 수정할 경우, T1이 같은 필드를 다시 읽으면 다른 값을 얻습니다.
* 허상 읽기(Phantom read): T1이 테이블의 로우 몆 개를 읽은 후 T2가 같은 테이블에 새 로우를 삽입할 경우, 나중에 T1이 같은 테이블을 다시 읽으면 T2가 삽입한 로우가 보입니다.
* 소실된 수정(Lost updates): T1, T2 모두 어떤 로우를 수정하려고 읽고 그 로우의 상태에 따라 수정하려는 경우 입니다. T1이 먼저 로우를 수정 후 커밋하기 전, T2가 T1이 수정한 로우를 똑같이 수정했다면 T1이 커밋한 후에 T2 역시 커밋을 하게 될 텐데, 그러면 T1이 수정한 로우를 T2가 덮어쓰게 되어 T1이 수정한 내용이 소실됩니다.

이론적으로 이런 저수준의 문제를 예방하려면 트랜잭션을 서로 완전히 격리하면 되겠지만, 이는 한 줄로 세워놓고 하나씩 실항하는 꼴이라서 엄청난 성능저하가 일어납니다. 실무에서는 성능을 감안해서 트랜잭션 격리 수준을 낮추는게 일반적입니다.

트랜잭션 격리 수준은 isolation 속성으로 지정하며 스프링 org.springframework.transaction.TransactionDefinition 인터페이스에 5가지 격리 수준이 정의 되어 있습니다.

|격리 수준|설명|
|---|---|
|DEFAULT|DB 기본 격리 수준을 사용합니다, DB는 READ_COMMITTED이 기본 격리 수준입니다.|
|READ_UNCOMMITTED|다른 트랜잭션이 아직 커밋하지 않은(UNCOMMITTED) 값을 한 트랜잭션이 읽을 수 있습니다. 따라서 Dirty read, Nonrepeatable read, Phantom read 문제가 발생할 가능성이 있습니다.|
|READ_COMMITTED|한 트랜잭션이 다른 트랜잭션이 커밋한(COMMITTED) 값만 읽을 수 있습니다. 이로써 Dirty read 는 해결되지만, Nonrepeatable read, Phantom read 문제는 여전히 남습니다. |
|REPEATABLE_READ|트랜잭션이 어떤 필드를 여러 번 읽어도 동일한 값을 읽도록 보장합니다. 트랜잭션이 지속되는 동안에는 다른 트랜잭션이 해당 필드를 변경할 수 없습니다. 그러나 여전히 Phantom read 문제가 있습니다.|
|SERIALIZABLE|트랜잭션이 테이블을 여러 번 읽어도 정확히 동일한 로우를 읽도록 보장합니다. 트랜잭션이 지속되는 동안에는 다른 트랜잭션이 해당 테이블에 삽입, 수정, 삭제를 할 수 없습니다. 동시성 문제는 모두 해소되지만 성능은 현저히 떨어집니다.|

_트랜잭션 격리는 하부 DB엔진이 지원하능 기능으로, 애플리케이션이나 프레임워크가 하는 일이 아닙니다. 또한 모든 DB 엔진이 트랜잭션 격리 수준을 다 지원하는 것도 아닙니다. JDBC 접속의 격리 수준을 변경하려면 java.sql.Connection 인터페이스의 setTransactionIsolation() 메서드를 호출합니다._

> 풀이

서점 애플리케이션에 도서 재고를 늘리고 체크하는 기능을 추가하면서 동시성 트랜잭션 문제를 살펴보겠습니다.

```java
public interface BookShop {
    public void increaseStock(String isbn, int stock);
    public int checkStock(String isbn);
}

public class JdbcBookShop extends JdbcDaoSupport implements BookShop {
    @Override
    @Transactional
    public void purchase(String isbn, String username) {
        int price = getJdbcTemplate().queryForObject("SELECT PRICE FROM BOOK WHERE ISBN = ?", Integer.class, isbn);

        getJdbcTemplate().update("UPDATE BOOK_STOCK SET STOCK = STOCK -1 WHERE ISBN = ?", isbn);

        getJdbcTemplate().update("UPDATE ACCOUNT SET BALANCE = BALANCE - ? WHERE USERNAME = ?", price, username);
    }

    @Override
    @Transactional
    public void increaseStock(String isbn, int stock) {
        String threadName = Thread.currentThread().getName();
        System.out.println(threadName + " - Prepare to increase book stock");

        getJdbcTemplate().update("UPDATE BOOK_STOCK SET STOCK + ? " + "WHERE ISBN = ?", stock. isbn);

        System.out.println(threadName + " - Book stock increase by " + stock);
        sleep(threadName);

        System.out.println(threadName + " - Book stock rolled back" + stock);
        throw new RuntimeException("Increased by mistake");
    }

    @Override
    @Transactional(isolation = Isolation.READ_UNCOMMITTED)
    public int checkStock(String isbn) {
        String threadName = Thread.currentThread().getName();
        System.out.println(threadName + " - Prepare to check book stock");

        int stock = getJdbcTemplate().queryForObject("SELECT STOCK FROM BOOK_STOCK " + "WHERE ISBN = ?", Integer.class, isbn);

        System.out.println(threadName + " - Book stock is " + stock);
        sleep(threadName);

        return stock;
    }

    private void sleep(String threadName) {
        System.out.println(threadName + " - Sleeping");

        try {
            Thread.sleep(10000);
        } catch (InterruptedException e) {}

        System.out.println(threadName + " - Wake up");
    }
}
```

동시성을 시뮬레이션하려면 여러 스레드로 실행해야 합니다. increase() 메서드는 마지막에 예외를 던져서 강제로 롤백하도록 장치합니다. 이제 클라이언트를 작성해 실행해보겠습니다.

다음은 서점 DB에 입력할 테스트 데이터입니다.

|ISBN|BOOK_NAME|PRICE|
|---|---|---|
|0001|The First Book|30|

|ISBN|STOCK|
|---|---|
|0001|10|

### READ_UNCOMMITTED 및 READ_COMMITTED 격리 수준

READ_UNCOMMITTED는 한 트랜잭션이 다른 트랜잭션이 아직 커밋하기 전에 변경한 내용을 읽을 수 있는 가장 하위의 격리 수준입니다.

```java
public class JdbcBookShop extends JdbcDaoSupport implements BookShop {
    @Transactional(isolation.READ_UNCOMMITTED)
    public int checkStock(String isbn) {}
}

public class Main {
    public static void main(String[] args) {
        // ...
        final BookShop bookShop = context.getBean(BookShop.class);

        Thread thread1 = new Thread(() -> {
            try {
                bookShop.increaseStock("0001", 5);
            } catch (RuntimeException e) {}
        }, "Thread 1");

        Thread thread2 = new Thread(() -> {
            bookShop.checkStock("0001");
        }, "Thread 2");

        thread1.start();
        try {
            Thread.sleep(5000);
        } catch (InterruptedException e) {}
        thread2.start();
    }
}
```

스레드 1은 도서 재고를 늘리고 스레드 2는 도서 재고를 체크합니다. 실행결과는 다음과 같습니다.

```text
Thread 1 Prepare to increase book stock
Thread 1 Book stock increased by 5
Thread 1 Sleeping
Thread 2 Preare to check book stock
Thread 2 Book stock is 15
Thread 2 Sleeping
Thread 1 Wake up
Thread 1 Book stock rolled back
Thread 2 Wake up
```

처음에 스레드 1이 재고를 늘리고 잠이드는데, 스레드 1의 트랜잭션이 아직 롤백되지 않은 상태에서 스레드 2가 재고를 읽습니다. 격리 수준이 READ_UNCOMMITTED 이므로 스레드 2는 스레드 1의 트랜잭션이 아직 변경 후 커밋하지 않은 재고를 읽게된것입니다.

그러나 스레드 1이 깨어나고 롤백이 되면서 스레드 2가 읽은 값은 더이상 우효하지 않은 값이 됩니다. 이때 Dirty read 문제가 발생합니다. 이는 checkStock() 격리 수준을 READ_COMMITTED로 올리면 해결 됩니다.

```java
public class JdbcBookShop extends JdbcDaoSupport implements BookShop {
    @Transactional(isolation.READ_COMMITTED)
    public int checkStock(String isbn) {}
}
```

```text
Thread 1 Prepare to increase book stock
Thread 1 Book stock increased by 5
Thread 1 Sleeping
Thread 2 Preare to check book stock
Thread 1 Wake up
Thread 1 Book stock rolled back
Thread 2 Book stock is 10
Thread 2 Sleeping
Thread 2 Wake up
```

READ_COMMITTED 격리 수준을 지원하는 DB는 수정은 되었지만 아직 커밋하지 않은 로우에 수정 잠금을 걸어둔 상태입니다. 결국 다른 트랜잭션은 커밋/롤백되고 수정 잠금이 풀릴 때까지 기다렸다가 읽을 수밖에 없습니다.

### REPEATABLE_READ 격리 수준

스레드를 재구성해서 다른 동시성 문제를 살펴보자. 이번엔 스레드 1이 재고를 체크, 스레드 2가 도서 재고를 늘리는 일을 하도록 변경해보면

```java
public class Main {
    public static void main(String[] args) {
        // ...
        final BookShop bookShop = context.getBean(BookShop.class);

        Thread thread1 = new Thread(() -> {
            bookShop.checkStock("0001");
        }, "Thread 1");

        Thread thread2 = new Thread(() -> {
            try {
                bookShop.increaseStock("0001", 5);
            } catch (RuntimeException e) {}
        }, "Thread 2");

        thread1.start();
        try {
            Thread.sleep(5000);
        } catch (InterruptedException e) {}
        thread2.start();
    }
}
```

```text
Thread 1 Prepare to check book stock
Thread 1 Book stock is 10
Thread 1 Sleeping
Thread 2 Prepare to increase book stock
Thread 2 Book stock increased by 5
Thread 2 Sleeping
Thread 1 Wake up
Thread 2 Wake up
Thread 2 Book stock rolled back
```

처음에 스레드 1이 도서 재고를 체크하고 잠이 드는데 아직 커밋되지 않은 상태입니다. 스레드 1이 잠자고 있는 동안 스레드 2가 시작되어 재고를 늘립니다. 격리 수준이 READ_COMMITTED이므로 스레드 2는 아직 커밋되지 않은 트랜잭션이 읽은 재고값을 수정할 수 있습니다. 만일 스레드 1이 깨어나 도서 재고를 다시 읽으면 그 값은 처음에 읽은 값이 아니게 됩니다. 이것이 Nonrepeatable read 문제 입니다.

이는 checkout()의 격리 수준을 REPEATABLE_READ로 한 단계 올리면 해결됩니다.

```java
public class JdbcBookShop extends JdbcDaoSupport implements BookShop {
    @Transactional(isolation.READ_COMMITTED)
    public int checkStock(String isbn) {}
}
```

```text
Thread 1 Prepare to check book stock
Thread 1 Book stock is 10
Thread 1 Sleeping
Thread 2 Prepare to increase book stock
Thread 1 Wake up
Thread 2 Book stock increased by 5
Thread 2 Sleeping
Thread 2 Wake up
Thread 2 Book stock rolled back
```

REPEATABLE_READ 격리 수준을 지원하는 DB는 조회는 되었지만 아직 커밋하지 않은 로우에 읽기 잠금을 걸어둔 상태이므로 다른 트랜잭션은 이 트랜잭션이 커밋/롤백하여 읽기 잠슴이 풀릴 때까지 기다렸다ㅏㄱ 수정할 수밖에 없습니다.

### SERIALIZABLE 격리 수준

트랜잭션 1이 테이블에서 여러 로우를 읽은 후, 트랜잭션 2가 같은 테이블에 여러 로우를 새로 추가한다고 합시다. 트랜잭션 1이 같은 테이블을 다시 읽으면 자신이 처음 읽었을 때와 달리 새로 추가된 로우가 있음을 감지하겠죠, 이를 Phantom read 문제라고 합니다. 사실 이는 여러 로우와 연관된다는 점만 빼면 Nonrepeatable read 문제와 비슷합니다.

이 문제를 해결하려면 SERIALIZABLE로 올려야 합니다. 이렇게 설정하면 전체 테이블에 읽기 잠금을 걸기 때문에 실행 속도가 가장 느립니다. 실무에서는 요건을 충족하는 가장 낮은 수준으로 격리 수준을 선택하는게 좋습니다.

## 10.8 트랜잭션 롤백 속성 설정하기

> 과제

기본적으로 (RuntimeException 및 Error형) 체크 예외가 아닌, 언체크 예외가 발생할 경우에만 트랜잭션이 롤백됩니다. 더러는 이런 규칙을 벗어나 직접 작성한 체크 예외가 나도 트랜잭션을 롤백시켜야 할 때가 있습니다.

> 해결책

트랜잭션 롤백에 영향을 주는 예외는 rollback 트랜잭션 속성에 정의합니다. 여기에 명시적으로 지정하지 않은 예외는 모두 기본 롤백 규칙(언체크 예외는 롤뱍, 체크 예외는 롤백 안 함)을 준수합니다.

> 풀이

트랜잭션 롤백 규칙은 @Transactional의 rollbackFor/noRollbackFor 속성에 지정합니다. 둘 다 Class[]형으로 선언된 속성이라서 각 속성마다 예외를 여러 개 지정할 수 있습니다.

```java
public class JdbcBookShop extends JdbcDaoSupport implements BookShop {
    @Transactional(
        propagation = Propagation.REQUIRES_NEW,
        rollbackFor = IOException.class,
        noRollbackFor = ArithmeticException.class)
    public void purchase(String isbn, String username) throws Exception {
        throw new ArithmeticException();
    }
}
```

## 10.9 트랜잭션 타임아웃, 읽기 전용 속성 설정하기

> 과제

스프링은 로우 및 테이블을 잠그기 때문에 실행 시간이 긴 트랜잭션은 리소스를 놔주지 않아 전체적으로 성능에 부정적인 영향을 미칩니다. 또 데이터를 읽기만 할 뿐 수정하지 않는 트랜잭션은 DB엔진이 최적화할 여지가 있으므로 이에 관한 속성을 설정ㄹ하면 애플리케이션의 전박적인 성능 향상을 기대할 수 있습니다.

> 해결책

timeout 트랜잭션 속성은 트랜잭션이 강제로 롤백되기 전까지 얼마나 오래 지속시킬지를 나타내는 시간으로, 이 속성을 설정해 장시간의 트랜잭션이 리소스를 오래 붙들고 있지 못하게 할 수 있습니다. read-only는 읽기 전용 트랜잭션을 표시하는 속성으로, 리소스가 트랜잭션을 최적화할 수 있게 귀띔응 해주는 것이지 리소스에 쓰기를 한다고 해서 실패 처리되는 건 아닙니다.

> 풀이

```java
public class JdbcBookShop extends JdbcDaoSupport implements BookShop {
    @Transactional(
        propagation = Propagation.REPEATABLE_READ,
        timeout = 30,
        readOnly = true)
    public int checkStock(String isbn) {}
}
```

## 10.10 로드타임 위빙을 이용해 트랜잭션 관리하기

> 과제

스프링의 선언적 트랜잭션 관리는 기본적으로 AOP 프레임워크를 사용해 작동합니다. 스프링 AOP는 IoC 컨테이너에 선언된 빈의 public 메서드에만 어드바이스를 적용할 수 있으므로 이 스코프로 트랜잭션 관리가 국한되는 문제가 있습니다. 하지만 public 외의 메서드나 IoC 컨테이너 외부에서 만든 객체의 메서드도 트랜잭션을 관리해야 할 경우가 있습니다.

> 해결책

스프링은 AnnotationTransactionAspect라는 AspectJ 애스팩트를 제공합니다. 덕분에 public 메서드가 아니든, IoC 컨테이너 밖에서 생성된 객체의 메서드든 상관없이 어느 객체, 어느 메서드라도 트랜잭션을 관리할 수 있습니다. 이 애스팩트는 @Transactional 메서드라면 물불을 가리지 않고 트랜잭션을 관리해주며 AspectJ 위빙을 컴파일 타임에 할지, 로드 타임에 할지만 선택해서 애스팩트를 활성화하면 됩니다.

> 풀이

이 애스팩트를 로드 타임에 도메인 클래스 안으로 위빙하려면 구성 클래스에 @EnableLoadTimeWeaving을 붙입니다. 스프링 AnnotationTransactionAspect로 트랜잭션을 관리하려면 @EnableTransactionManagement를 추가로 붙이고 mode 속성을 ASPECTJ라고 지정합니다. (mode 속성은 ASPECTJ, PROXY 둘 중 하나를 지정). ASPECTJ는 컨테이너가 로드 타임 또는 컴파일 타임에 위빙하여 트랜잭션 어드바이스를 적용하도록 지시합니다. 이렇게 하려면 로드 타임 또는 컴파일 타임에 적절한 구성을 하고 스프링 JAR 파일을 클래스패스에 위치시켜야 합니다.

한편 PROXY는 컨테이너가 스프링 AOP 메커니즘을 사용하게끔 지시합니다. ASPECTJ 모드에서는 인터페이스에 @Transactional을 붙여 구성하는 방법은 지원되지 않습니다. 트랜잭션 애스팩트는 자동으로 활성화되며 이 애스팩트가 사용할 트랜잭션 관리자를 지정해야 합니다. 기본적으로 이름이 transactionalManager인 트랜잭션 관리자 빈을 찾습니다.

```java
@Configuration
@EnableTransactionManagement(mode = AdviceMode.ASPECTJ)
@EnableLoadTimeWeaving
public class BookstoreConfiguration {}
```

_스프링의 AspectJ 애스팩트 라이브러리를 사용하려면 spring-aspects 모듈을 클래스패스에 넣어야 합니다. 로드 타임 위빙을 활성화하려면 spring-instrument 모듈 안의 자바 에이전트를 포함시켜야합니다._
