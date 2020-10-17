***이 글은 모던 자바 인 액션을 참고해서 쓴 글입니다.***
# 1. 동작 파라미터화 코드 전달하기
## 1.0. 개요
    소프트웨어는 고객의 요구를 만족시켜야 한다. 그런데 고객의 요구사항은 어떤 상황에서 일을 하더라도
    항상 바뀐다. 동작파라미터를 이용하면 바뀌는 요구사항에 대해서 효과적으로 대응할수 있다.
    그럼 동작파라미터란 무엇일까? 간단히 말하면 아직은 어떻게 실행될것인지 결정하지 않은 코드블록을 의미한다.
    즉, 나중에 실행될 메서드의 인수로 코드 블록을 전달할 수 있다.
    
## 1.1. 변화하는 요구사항에 대응하기
    코드를 개선하면서 유연한 코드를 만드는 모법사례를 보자.
    간단하게 장바구니에서 빨강색 사과를 필터링 하는 코드를 만들어보자.
```java
enum Color { RED, GREEN, BLUE }

public static List<Apple> filterRedApples(List<Apple> inventory) {
    List<Apple> results = new ArrayList<>();
    for (Apple apple : inventory) {
        if (RED.equals(apple.getColor())){
            results.add(apple);
        }
    }
    return results;
}
```
    근데 고객이 갑자기 초록색 사과도 고르고 싶다고 하자. 
    그럼 2가지 선택지가 생긴다. filterRedApples 코드를 복사해서 filterGreenApples 코드를 만들거나
    Color 를 파라미터로 받는 방법이 있다.
    2번째 방법과 같이 비슷한 코드가 반복 존재한다면 그 코드를 추상화 하는것이 가장 좋은 방법이다.
    또한 이는 요구하는 색이 변하더라도 요구에 응할수 있게 된다.
```java
public static List<Apple> filterApplesByColor(List<Apple> inventory, Color color) {
    List<Apple> results = new ArrayList<>();
    for (Apple apple : inventory) {
        if(color.equals(apple.getColor())) {
            results.add(apple);
        }
    }
    return results;
}
```
    이번엔 고객이 색 뿐만 아니라 무게도 필터링 하고 싶은 요구사항이 생겼다고 하자.
    위와 같이 무게를 파라미터로 받고 필터링 하는 방법도 있다. 그런데 그러면 색 을 필터링하는 코드와
    중복되는 코드가 생산이 된다. 이는 소프트웨어 공학의 DRY(Don't repeat yourself) (같은것을 반복하지 마라)
    원칙을 어기는 것이다. 물론 색 과 무게 둘다 인수를 받는 코드를 만들고 flag 변수를 주어서 true 일때는 색,
    false 일때는 무게를 필터링하게 만들수 있지만 이는 개발자 입장에서 flag 라는 용도를
    메소드 내부를 보기전까지 파악하기 힘들며 요구사항이 늘어날때마다 이런식으로 처리할수도 없는 일이다.
## 1.2. 동작 파라미터화
    크게 우리가 파라미터를 주는것은 사과의 어떤 속성을 주고 참인가 거짓인가를 판단하는 것이다.
    즉 참 또는 거짓은 반환하는 함수 프레디케이트를 정의하면 된다.
```java
public interface ApplePredicate {
    boolean test (Apple apple);
}

public class AppleHeavyWeightPredicate implements ApplePredicate {
    public boolean test (Apple apple) {
        return apple.getWeight() > 150; 
    }
}

public class AppleRedColorPredicate implements ApplePredicate {
    public boolean test (Apple apple) {
        return RED.equals(apple.getColor()); 
    }
}
```
    위와 같이 조건에 따라 필터의 동작이 다르다는것을 예상할수 있는데 이를 전락 디자인 패턴이라도 한다.
    이는 전략(동작)을 런타임 시점에 선택하는 기법이다.
    그럼 이제 filter 메소드를 프레디케이트 객체를 인수로 받도록 변경해보자
```java
public static List<Apple> filterApples(List<Apple> inventory, ApplePredicate p) {
    List<Apple> results = new ArrayList<>();
    for (Apple apple : inventory){
        if (p.test(apple)) {
            results.add(apple);
        }
    }
    return results;
}
```
    요구사항에 우아한 코드가 되었다. 어떤 요구사항이 생기더라도 프레디케이트 객체를 받들어서 메소드로
    넘기기만 하면된다. 이는 filterApples 메소드의 동작을 파라미터화 한것이다.
## 1.3. 복잡한 과정 간소화
    현재 한가지 불편한 점이 있다면 filterApples 의 동작을 파라미터로 전달하려면 ApplePredicate 인터페이스를
    구현하는 클래스를 정의해주고 인스턴스화 해줘야한다.
    이를 간편하게 클래스의 선언과 인스턴스화를 동시에 해주는 익명 클래스 라는 기법을 이용하면 쉽게 해줄수 있다.
    익명 클래스란 이름이 없는 클래스 이다. 이를 이용하면 클래스 선언과 인스턴스화를 동시에 할수 있는데,
    이는 즉석에서 필요한 부분을 구현해서 사용할수 있다.
```java
List<Apple> redApples = filterApples(inventory, new ApplePredicate() {
    public boolean test(Apple apple) {
        return RED.equals(apple.getApple());
    }
});
```
    근데 익명 클래스도 결국은 많은 공간을 차지하게 된다. 또한 코드 가독성이 상당히 떨어지게 된다.
    이를 간결하게 만드는 방법이 람다 표현식을 이용해서 간단하게 만들어보자
```java
List<Apple> redApples = 
    filterApples(inventory, (Apple apple) -> RED.equals(apple.getApple()));
```
    또한 사과에 종속되지 않고 추상화 시킬수도 있다.
```java
public interface Predicate<t> {
    boolean test(T t);
}

public static <T> List<T> filter(List<T> list, Predicate<T> p) {
    List<T> results = new ArrayList<>();
    for (T e : list){
        if (p.test(e)){
            results.add(e);
        }
    }
}
```
## 1.4. 실전 예제
**TODO**
실전예제 이해하기 
    
    
    
    


        
        
