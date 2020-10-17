***이 글은 스프링 부트로 배우는 자바 웹 개발 을 참고해서 쓴 글입니다.***
# 1. 어노테이션
## 1.0 개요
어노테이션은 일종의 메타데이터로, 주석처럼 코드에 추가해서 컴파일 또는 런타임 시점에 해석된다.
    
## 1.1 어노테이션 만들기
어노케이션은 다음과 같이 interface에 @를 붙여서 선언하고, 어노케이션이 적용될 대상과 
동작 방식을 지정할 수 있다.
```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Annotation1{}
```
Target 은 어노테이션이 적용되는 대상을 의미하는데, ElementType의 요소 중에서
선택해서 지정한다.

|대상 요소명|적용 대상|
|--------|-------|
|TYPE|클래스 및 인터페이스|
|FIELD|클래스의 멤버 변|
|HETHOD|메서드|
|PARAMETER|파라미터|
|CONSTRUCTOR|생성자|
|LOCAL_VARIABLE|지역변수|
|ANNOTATION_TYPE|어노테이션 타입|
|PACKAGE|패키지|
|TYPE_PARAMETER|타입 파라미터|
|TYPE_USE|타입 사용|

Retention은 어노테이션이 적용될 봄위를 결정하는데 세 가지 유형이 있다.
- Class 어노테이션 작성 시 기본값으로 클래스 파일에 포함되지만 JVM이 로드하지 않는다.
- Runtime 클래스 파일에 포함되고, JVM이 로드해서 리플렉션 API로 참조 가능하다.
- Source 컴파일 때만 사용되고, 클래스 파일에 포함되지 않는다.

문자열과 숫자 타입의 값을 세팅하는 어노테이션을 만들어보자
```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface MyAnnotation{
    String strValue();
    int intValue();
}
```
MyAnnotation은 strValue 와 intValue를 입력할 수 있는 어노테이션이다.
이를 이용해 서비스 클래스를 만들어보자
```java
import MyAnnotation;

public class MyService {
    @MyAnnotation(strValue = "hi", intValue=0607)
    public void printSomething() {
        System.out.println("test");
    }   
}
```
리플렉션 API로 printSomething 메서드에 선언한 MyAnnotation 값을 확인해 보자
```java
public class App {
    public static void main(String[] args){
        Method[] methods = Class.forName(MyService.class.getName()).getMethods();
        
        for (int i=0; i<methods.length; i++) {
            if (methods[i].isAnnotationPresent(MyAnnotation.class)){
                MyAnnotaion an = methods[i].getAnnotation(MyAnnotation.class);
                System.out.println(an.strValue());
                System.out.println(an.intValue());
            }
        }
    }
}
```
스프링에서 사용하는 많은 어노테이션들도 이와 같은 어노테이션이 있고 어노테이션을 해석하는 역할을 하는 클래스가 있다.
스프링 부트에서 설정 자동화를 위해 사용되는 어노테이션을 알아보자

## 1.2 스프링 부트 어노테이션
먼저 내부적응로 사용하는 어노테이션을 알아보자

### 1.2.1 ImportSelector
스프링 부트에는 자바로 작성된 많은 설정 클래스들이 있다. 이런 설정 클래스들이 어노테이션의 값에 따라서
로딩 여부가 결정되는데, 이럴때 사용하는게 ImportSelector 인터페이스다. 간단한 예시를 살펴보자
```java
public class MyBean {
    @Getter
    private String msg;
    public MyBean(String msg) {
        this.msg = msg;
    }
}

public class UseMyBean {
    @Autowired
    private MyBean myBean;
    
    public void printMsg() {
        System.out.println(myBean.getMsg());
    }
}
```
UseMyBean 클래스는 @Autowired 어노테이션으로 MyBean 클래스에 의존성을 주입하고 메시지를 출력한다.
이제 MyBean 클래스를 빈으로 등록해 주는 설정 클래스들을 만들자.
```java
@Configuration
public class AConfig {
    @Bean
    MyBean myBean() {
        return new MyBean("Hello AConfig");
    }   
}
```
AConfig 클래스는 곧이어 살펴볼 BConfig 클래스와 동일한 설정 클애스로서 MyBean 클래스를 빈으로 등록하는
역할을 한다. ImportSelector 확인을 위해 비슷한 기능응 하는 BConfig 클래스를 만들자
```java
@Configuration
public class BConfig {
    @Bean
    MyBean myBean() {
        return new MyBean("Hello BConfig");
    }   
}
```
BConfig, AConfig 클래스는 각기 다른 메시지 값으로 MyBean 클래스를 빈으로 등록한다.
어노테이션 값에 따라서 BConfig, AConfig 를 선택하는 클래스를 만들어보자
```java
public class MyImportSelector implements ImportSelector {
    @Override
    public String[] selectImports(AnnotationMetadata importingClassMetadata) {
        AnnotationAttributes attr = AnnotationAttributes.fromMap(
            importingClassMetadata.getAnnotationAttributes(EnableAutoMyModule.class.getName(), false));
            String value = attr.getString("value");
            if ("someValue".equals(value)) {
                return new String[] {AConfig.class.getName()};
            } else {
                return new String[] {BConfig.class.getName()};
            }
    }
}
```
MyImportSelector는 ImportSelector 인터페이스를 상속받아서 selectImports 메서드를 구현한 클래스다.
selectImports 메서드는 EnableAutoMyModule 어노테이션 값이 someValue 값에 따라 클래스를 반환한다.
@EnableAutoMyModule 어노테이션을 만들어보자
```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
@Import(MyImportSelector.class)
public @interface EnableAutoMyModule {
    String value() default "";
}
```
@EnableAutoMyModule 어노테이션을 사용할 클래스에서 MyImportSelector 클래스에 selectImports 메서드가
동작하도록 MyImportSelector 클래스를 임포트한다. 이제 @EnableAutoMyModule 어노테이션을 사용하는
MainConfig 클래스를 만들자
```java
@Confguration
@EnableAutoMyModule("someValue")
public class MainConfig {
    @Bean
    public UseMyBean useMyBean() {
        return new UseMyBean();
    }
}

public class App {
    public static void main(String[] args){
        ApplicationContext context = new AnnotationConfigApplicationContext(MainConfig.class);
        UseMyBean bean = context.getBean(UseMyBean.class);
        bean.printMsg(); // Hello AConfig
    }
}
```

### 1.2.2 @Conditional
@Conditional 어노테이션은 이름처럼 조건에 따라 자바 설정 클래스를 선택할 수 있게 해주는 어노테이션이다.
Condition 인터페이스를 상속받은 클애스들과 같이 사용하는 어노테이션으로 matchs 메소드가 true 인 빈을 생성한다
```java
public interface MsgBean {
    default void printMsg() {
        System.out.println("My Bean default is running");
    }
}

public class siteAConfigCondition implements Condition {
    @Override
    public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
        return "sitea".equals(context.getEnvironment().getProperty("env", "sitea"));
    }
}

public class siteBConfigCondition implements Condition {
    @Override
    public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
        return "siteb".equals(context.getEnvironment().getProperty("env", "siteb"));
    }
}

@Component
@Conditional(siteAConfigCondition.class)
public class SiteABean implements MsgBean {
    @Override
    public void printMsg() {
        System.out.println("Site A is working");
    }
}

@Component
@Conditional(siteBConfigCondition.class)
public class SiteBBean implements MsgBean {
    @Override
    public void printMsg() {
        System.out.println("Site B is working");
    }
}
```
vm옵션을 전달할 때는 -D를 앞에 붙이고 사용하면 된다. env 는 Denv로 표현이 가능하다.

### 1.2.3 @AutoConfigruationPackage
@AutoConfigruationPackage 어노테이션은 패키지 경로를 스프링 콘텍스트가 스캔 가능하도록 하는 역활을 한다.
@AutoConfigruationPackage 어노테이션은 AutoConfigruationPackage.Register 를 임포트하는데,
이 클래스가 실제로 패키지 정보를 등록하는 역활을 한다.
@EnableAutoConfiguration 어노테이션은 @AutoConfigurationPackage 어노테이션을 포함하고 있어서
@AutoConfigurationPackage 선언한것과 동일한 효과를 볼 수 있다.

### 1.2.4 @EnableConfigurationProperties
스프링 부트는 프로퍼티를 그룹화해서 사용할수 있습니다.
다음과 같은 프로퍼티 파일이 있다면
```properties
spring.main.web-enviroment=false
myapp.server-ip=192.168.34.56
myapp.name=My Config App
myapp.description=This is an example
```
앞부분이 같을때 prefix를 사용해서 참조할수 있다.
```java
@ConfigurationProperties(prefix="myapp")
@Getter
@Setter
@toString
public class MyProperties {
    private String serverIp;
    private String name;
    private String description;
}
```
@ConfigurationProperties 어노테이션은 이렇게 외부 속성값을 참조할때 사용하는 어노테이션으로
속성값으로 prefix를 설정할수 있다.
```java
@SpringBootApplication
@EnableConfigurationProperties({MyProperties.class})
public class PropApp {
    public static void main(String[] args){
        SpringApplication.run(PropApp.class, args);
    }
    @Autowired
    MyProperties prop;
    @Bean
    CommandLineRunner values() {
        return ar -> {
            System.out.println(prop.toString());
        };
    }
}
```
@EnableConfigurationProperties 어노테이션은 MyProperties와 같이 프로퍼티와 매핑된
클래스를 사용할때 @Bean 어노테이션 대신 사용할 수 있는 어노테이션 이다.
Myproperties 클래스와 같이 빈으로 등록할 수 없는 경우에 사용할 수 있다.

## 1.2


    

