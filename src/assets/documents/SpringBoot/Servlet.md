***이 글은 스프링 부트로 배우는 자바 웹 개발 을 참고해서 쓴 글입니다.***
# 1. 서블릿
## 1.1 서블릿 시작하기
서블릿은 JVM 기반에서 웹 개발을 하기 위한 명세이자 API다. 자바를 실행하려면 JRE가 필요한것 처럼
서블릿을 실행하려면 웹 애플리케이션 컨테이너가 필요하다.
서블릿은 Java EE에 포함된 스펙 중의 하나로 자바에서 HTTP 요청과 응답을 처리하기 위한 내용들을 담고있다.

## 1.2 서블릿 내부 동작
서블릿은 자신만의 생명주기를 가지고 있어 웹 애플리케이션 컨테이너에서 콘텍스트가 초기화되면 생명주기가 시작한다.
서블릿의 생명주기는 초기화, 서비스, 소멸로 구성되며, 초기화 단계예서는 로드한 서블릿의 인스턴스를 생성하고
리소스를 로드하는 등 클래스 생성자의 초기화 작업과 동일한 역할을 수행한다.
서비스 단계에서는 클라이언트의 요청에 따라 호출할 메서드를 결정한다.
