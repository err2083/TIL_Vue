***이 글은 스프링 부트로 배우는 자바 웹 개발 을 참고해서 쓴 글입니다.***
# 1. 스프링 부트의 구성 요소
## 1.1 스프링 부트 모듈
스프링 부트는 크게 네 가지 부분으로 나눠볼 수 있다

|명칭|역할|비고|
|---|---|---|
|AutoConfigurator|설정을 간소화|핵심 컴포넌트|
|Starter|스프링 기반의 다양한 모듈 사용 가능|각 모듈별로 제공, boot-Starter-모듈명 과 같은 작명규칙
|CLI|스프링 부트로 만든 애플리케이션을 커맨드로 실행|ex)spring run
|Actuator|스프링 부트로 만든 어플리케이션을 모니터링할 기능 제공|별도의 JAR 파일을 클래스패스에 추가 후 사용


### 1.1.1 @SpringBootApplication
@SpringBootApplication 어노테이션은 여러 개의 어노테이션들이 포함된 어노테이션으로
spring-boot-autoconfigure.jar 파일안에 포함되어 있는데 다음과 같은 내용이 있다.
```java
@Target(ElementType.Type)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Inherited
@SpringBootConfiguration
@EnableAutoConfiguration
@ComponentScan(excludeFilters = {
    @Filter(type = FilterType.CUSTOM, classes = TypeExcludeFilter.class),
    @Filter(type = FilterType.CUSTOM, classes = AutoConfigurationExcludeFilter.class)
})
public @interface SpringBootApplication {
    Class<?>[] exclude() default {};
    Stirng[] excludeName() default {};
    @AliasFor(annotation = ComponentScan.class, attribute = "basePackages")
    String[] scanBasePackages() default {};
    @AliasFor(annotation = ComponentScan.class, attribute = "basePackageClasses")
    Class<?>[] scanBasePackageClasses() default {};
}
```
@SpringBootConfiguration 어노테이션은 @Configuration 어노테이션과 비슷하다. 
단지 스프링 부트를 위하 설정임을 나타내기 위해 사용한다. 이를 단순하게 보면 다음과 같다.
SpringBootApplication = ComponentScan + configuration + EnableAutoConfiguration
이 중에서 EnableAutoConfiguration에 대해 살펴보면
```java
@SuppressWarnings("deprecation")
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Inherited
@AutoConfigurationPackage
@Import(EnableAutoConfigurationImportSelector.class)
public @interface EnableAutoConfiguration {}
```
@EnableAutoConfiguration 도 많은 어노테이션을 사용하는데
EnableAutoConfigurationImportSelector는 AutoConfigurationImportSelector를 상속받은 클래스로
isEnabled 메서드를 오버라이드 해서 사용하는데 EnableAutoConfigurationImportSelector 와
같은 클래스인지 체크한 후 EnableAutoConfiguration 에서 ENABLED_OVERRIDE_PROPERTY 필드값이
있으면 true 를 반환한다.
스프링 부트 애플리케이션 실행 시에 debug 옵션을 추가하면 실행시 로딩되는 설정 클래스들에 대한 정보를 얻을수 있다.

### 1.1.2 Starter
스타터는 AutoConfigurator를 기반으로 스프링 부트 애플리케이션에서 별도의 설정 없이 편리하게 사용할 수
있도록 만든 모듈 규격이다. 하나의 애플리케이션을 다수의 모듈로 구상하고자 할 경우 BootStarter를 이용해서
여러 개의 모듈로 만들어서 관리할 수 있다.
예를 들어 boot-starter-web을 추가하면 springmvc 와 embed-tomcat도 함꼐 추가되어
별도의 톰캣 설치 없이 애플리케이션 실행이 가능하다. 추가한 의존성들은 AutoConfiguration을 통해
dispatcher-servlet.xml과 같은 설정없이 사용할수 있다.

### 1.1.3 CLI
스프링 부트는 커맨드 라인 인터페이스를 제공하는데 스프링 부트 애플리케이션을 JAR로 패키징하면 main 클래스가
실제로는 본인이 만든 클래스가 아닌 jarLauncher가 된다. 그리고 이 jarLauncher가 main 클래스를 로드하는
형태로 전환되어 커맨드를 입력받을 수 있게 된다.

### 1.1.4 액추에이터
액추에이터는 애플리케이션 관리에 필요한 정보를 제공하는 역활을 한다. Actuator jar파일을 클래스 파일에 추가하면
REST API처럼 URL에 힙 메모리, 서버 상태 등 모니터링에 필요한 정보를 확인할 수 있다.

## 1.2 스프링 부트 스타터 만들기
   
