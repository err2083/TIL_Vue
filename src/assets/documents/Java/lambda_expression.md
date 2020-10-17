***이 글은 모던 자바 인 액션을 참고해서 쓴 글입니다.***
# 1. 람다 표현식
## 1.0 개요 
    익명 클래스로 다양한 동작을 구현할수 있지만 만족할 만큼 코드가 깔금하지 않다.
    이는 자바 8의 새로운 기능인 람다 표현식을 이용해서 익명 클래스처럼 이름이 없는
    함수 이면서 메서드를 인수로 깔금하게 전달할 수 있다.
## 1.1 람다란 무엇인가?
    람다 표현식은 메서드로 전달할 수 있는 익명 함수를 단순화한 것이다,
    람다 표현식에는 이름은 없지만, 파라미터 리스트, 바디, 반환 혈식, 예외리스트를 가질수 있다.
    
    1. 익명 - 보통의 메서드와 달리 이름이 없으면 익명이라고 표현한다,
    2. 함수 - 람다는 메서드처럼 클래스에 종속되지 않으므로 함수라고 호칭한다.
    3. 전달 - 람다 표현식을 메서드 인수로 전달하거나 변수로 저장할 수 있다.
    4. 간결성 - 자질구레한 코드를 구현할 필요가 없다.
    
    예시로 기존 코드를 람다 코드로 변환해보자
```java
기존 코드
Comparator<Apple> byWeight = new Comparator<Apple>() {
    public int compare(Apple a1, Apple a2) {
        return a1.getWeight().compareTo(a2.getWeight());
    }
}

람다 코드
Comparator<Apple> byWeight = 
    (Apple a1, Apple a2) -> a1.getWeight().compareTo(a2.getWeight());
```
    코드가 훨신 간단해지고 명확해 졌다. 람다 표현식을 이용하면 compare 메서드의 바디를
    직접 전달하는것 처럼 코드를 전달할 수 있다.
    람다의 문법은 다음과 같이 표현할수 있다.
    1. (parameters) -> expression
    2. (parameters) -> { statements; }
    
    람다는 다음과 같은 사용 사례가 있다.

    1. 불리언 표현식
        (List<String> list) -> list.isEmpty()
    2. 객체 생성
        () -> new Apple(10)
    3. 객체에서 소비
        (Apple a) -> { System.out.println(a.getWeight()); }
    4. 객체에서 선택/추출
        (String s) -> s.length()
    5. 두 값을 조합
        (int a, int b) -> a * b
    두 객체 비교
        (Apple a1, Apple a2) -> a1.getWeight().compareTo(a2.getWeight())
## 1.2 어디에, 어떻게 람다를 사용할까?
    정확히 람다는 함수형 인터페이스라는 문맵에서 사용할 수 있다.
    그럼 함수형 인터페이스라는것은 어떤것일까?
    대표적으로 객체를 받아 불리언으로 반환해주는 Predicate<T>가 함수형 인터페이스 이다
```java
public interface Predicate<T>{
    boolean test (T t);
}
```
    간단히 말해서 정확히 하나의 추상 메서드를 지정하는 인터페이스 이다.
    Predicate<T> 외에도 Comparator, Runnable 등이 있다.
    그럼 함수형 인터페이스로는 무엇을 할 수 있을까?
    람다 표현식으로 함수형 인터페이스의 추상 메서드 구현을 직접 전달할 수 있으므로
    전체 표현식을 함수형 인터페이스를 구현한 클래스의 인스턴스로 취급할 수 있다.
    다음과 같이 Runnable 인터페이스 예제를 보자
```java
Runnable r1 = () -> System.out.println("Hello World 1");
Runnable r2 = new Runnable() {
    public void run() {
        System.out.println("Hello World 2");
    }
};
public static void process(Runnalbe r) {
    r.run();
}
process(r1);
process(r2);
process(() -> System.out.println("Hello World 3"));
```
    함수형 인터페이스의 추상 메서드 시그니처는 람다 표현식의 시그니처를 가리킨다,
    람더 표현식의 시그니처를 서술하는 메서드를 함수 디스크립터라고 하는데,
    예를 들어 Runnable 인터페이스의 추상 메서드 run은 인수와 반환값이 없으므로
    Runnable 인터페이스는 인수와 반환값이 없는 시그니처로 생각할 수 있다.
    
    함수 인터페이스는 @Functionallnterface 어노테이션으로 표현할수 있는데,
    @Functionallnterface로 인터페이스를 선언했찌만 실제로 함수형 인터페이스가 아니라면
    컴퍼일러가 에러는 발생시킨다,
## 1.3 람다 활용 : 실행 어라운드 패턴
    자원 처리에 사용하는 순환 패턴은 자원을 열고, 처리한 후, 닫는 순서로 이루어져 있다.
    즉, 실제 자원을 처리하는 부분을 설정, 정리 과정이 둘러싸는 형태를 가지는데,
    이를 실행 어라운드 패턴 이라고 한다.
```java
public String processFile() throws IOException {
    try (BufferedReader br = new BufferedReader(new FileReader("data.txt"))) {
        return br.readLine();
    }
}
```
    위와 같은 코드를 보면 실제 처리하는 부분은 br.readLine, 설정, 정리 과정은 
    try-with-resources 구문을 이용한다.
    그럼 람다식을 이용해서 개선해보자
    먼저 한줄씩 읽는것아 아니라 두줄씩 또는 다른 요구사항으로 변화한다고 생각해보자.
    그러면 실제 처리하는 부분을 동작 파라미터화하면 다양한 요구사항을 충족할수 있다.
```java
String result = processFile((BufferedReader br) -> br.readLine() + br.readLine());
``` 
    그리고 BufferedReader -> String 과 IOException을 예외처리 할수있는 시그니처와 일치하는
    함수형 인터페이스를 만들어보자
```java
@FunctionalInterface
public interface BufferedReaderProcessor {
    String process(BufferedReader b) throws IOEception;
}

public String processFile(BufferedReaderProcessor p) throws IOEception{}
```
    이제 process 메서드의 시그니처와 일치하는 람다를 전달할수 있다.
    람다 표현식으로 함수형 인터페이스의 추상 메서드 구현을 직접 전달할수 있으며,
    전달된 코드는 함수형 인터페이스의 인스턴스로 전달된 코드와 같은 방식으로 처리한다.
    따라서 실제로 처리하는 부분을 BufferedReaderProcessor 객체의 process 로 바꾸면 된다.
 ```java
public String processFile(BufferedReaderProcessor p) throws IOException {
    try (BufferedReader br = new BufferedReader(new FileReader("data.txt"))) {
        return p.process(br);
    }
}

String oneLine = processFile((BufferedReader br) -> br.readLine());
String twoLines = processFile((BufferedReader br) -> br.readLine() + br.readLine());
```
## 1.4 함수형 인터페이스 사용
    앞에서 살펴본것 처럼 함수형 인터페이스는 오직 하나의 추상 메서드를 지정한다,
    또한 함수형 인터페이스의 추상 메서드는 람다 표현식의 시그니처를 묘사하는데,
    함수형 인터페이스의 추상 메서드 시그니처를 함수 디스크립터 라고 한다.    
    다양한 람다 표현식을 사용하려면 공통의 함수 디스크립터가 필요한데 이미 자바는
    Comparable, Runnable, Callable 등 다양한 함수형 인터페이스를 제공한다.
    이는 우리가 따로 정의할 필요없이 바로 사용할수 있다는 장점이 있다.
    그럼 java.util.function 패키지의 Predicate, Consumer, Function 인터페이스를 살펴보자
### 1.4.1 Predicate
    Predicate<T> 인터페이스는 test 라는 추상 메서드를 정의하며 test는 
    제너릭 형식 T의 객체를 인수로 받아 불리언을 반환 한다.
```java
@FunctionalInterface
public interface Predicate<T> {
    boolean test(T t);
}

public <T> List<T> filter(List<T> list, Predicate<T> p) {
    List<T> results = new ArrayList<>();
    for (T t : list){
        if(p.test(t)){
            results.add(t);
        }
    }
    return results;
}

Predicate<String> nonEmptyStringPredicate = (String s) -> !s.isEmpty();
List<String> nonEmpty = filter(listOfStrings, nonEmptyStringPredicate);
```
### 1.4.2 Consumer
    Consumer<T> 인터페이스는 제너릭 형식 T 객체를 받아서 void를 반환하는 accept 라는
    추상화 메서드를 정의한다. T 형식의 객체를 인수로 받아서 어떤 동작을 수행하고 싶을때
    Consumer 인터페이스를 사용할수 있다.
```java
@FunctionalInterface
public interface Consumer<T> {
    void accept(T t);
}

public <T> void forEach(List<T> list, Consumer<T> c) {
    for(T t : list) {
        c.accept(t);
    }
}

forEach(Arrays.asList(1,2,3,4,5), (Integer i) -> System.out.println(i));
```
### 1.4.3 Function
    Function 인터페이스는 제너릭 형식 T를 인수로 받아서 제너릭 형식 R 객체를 
    반환하는 apply를 정의 한다.
```java
@FunctionalInterface
public interface Function<T,R> {
    R apply(T t);
}

public <T,R> List<R> map(List<T> list, Function<T,R> f) {
    List<R> results = new Arrays<>();
    for(T t : list) {
        results.add(f.apply(t));
    }
    return results;
}

List<Integer> l = map(Arrays.asList("lambdas", "in", "action"), 
    (String s) -> s.length());
```
### 1.4.4 기본형 특화
    지금까지 살펴본 제너릭 함수형 인터페이스는 파라미터로 참조형만 사용할수 있다.
    이는 자바에서 기본형을 참조형으로 변환하는 박싱, 참조형을 기본형을 반환하는 언박싱,
    박싱과 언박싱이 자동으로 이루어지는 오토박싱 기능을 이용해서 사용할수 있다.
    예를 들어 다음과 같은 코드는 유효한 코드이다
```java
List<Integer> list = new ArrayList<>();
for (int i = 300; i < 400; i++) {
    list.add(i);
}
``` 
    하지만 이러한 박싱 과정은 기본형을 감싸는 래퍼이며 힙에 저장된다. 따라서
    박싱한 값은 메모리를 더 소비하며 기본형읋 가져올 때도 메모리 탐색 과정이 필요하다.
    이러한 오토박싱 동작을 피할수 있도록 특별한 버전의 함수형 인터페이스를 제공한다,
 ```java
public interface IntPredicate {
    boolean test(int t);
}

IntPredicate evenNumbers = (int i) -> i % 2 == 0;
evenNumbers.test(1000); <- 박싱 없음

Predicate oddNumbers = (int i) -> i % 2 != 0;
oddNumbers.test(1000); <- 박싱
```
## 1.5 형식 검사, 형식 추론, 제약
    람다가 사용되는 콘텍스트(람다가 전달될 메서드 파라미터 또는 람다가 할당되는 변수)를 
    이용해서 람다의 형식을 추론할 수 있다. 이를 콘텍스트에서 기대되는 람다 표현식의
    혈식을 대상 형식이라고 부른다,
    예를 들어
```java
List<Apple> heavierThan150g = filter(list, (Apple a) -> a.getWeight() > 150);
```
    위와 같은 코드가 있을때 우리는 filter 의 두번째 파라미터가 객체를 받아
    불리언으로 반환해주는 Predicate<Apple> 형식이라는 것을 추론할수 있다.
    이는 다이아몬드 연산자(<>) 와 같이 인스턴스의 표현식의 형식 인수가 콘텍스트에
    의해 추론되는것과 같다. 
    이러한 대상 형식이라는 특성 때문에 같은 람다 표현식이라도 호환도는 추상 메서드
    를 가진 다른 함수형 인터페이스로 사용될 수 있다.
    이때 누구를 호출하는지 명확하게 하려면 다음과 같이
    execute((Action) () -> {}); 표현할수도 있다.
    
    우리는 코드를 더 쉽게 만들 수 있는데, 자바 컴파일러는 대상 형식을 이용해서
    함수 디스크립터를 알 수 있으며, 람다 표현식의 파라미터 형식에 접근할 수 있으므로
    다름과 같이 람다 파라미터 형식을 추론할 수 있다.
```java
List<Apple> greenApples = filter(inventory, 
    apple -> GREEN.equals(apple.getColor()));
```
    람다는 파라미터로 받은 변수 뿐만 아니라 외부에 정의된 변수를 사용할수 있는데,
    이를 람다 캡처링 이라고 부른다.
```java
int portNumber = 4241;
Runnable r = () -> System.out.println(portNumber);
```
    그러나 제약이 있는데 명시적으로 final 선언을 해줘야한다.
    즉, 람다에서 참고하는 지역변수는 final 로 선언되거나 실직적으로 final로 취급해야한다,
    왜 이런 제약이 생겼냐면, 우선 내부적으로 인스턴수 변수는 힙, 지역 변수는 스택에 위치한다.
    람다에서 지역 변수에 바로 접근할수 있다는 가정하에, 람다가 스레드에서 실행된다면
    변수를 할당한 스레드가 사라져서 변수 할당이 해제되었는데도 람다가 실행하는 스레드
    에서는 해당 변수에 접근하려 할 수 있다. 따라서 자바는 원래 변수에 접근이 아니라
    복사본을 제공한다. 따라서 복사본의 값이 바뀌지 않아야 하므로 지역 변수에는
    값을 한번만 할당해야 한다는 제약이 생긴 것이다.
    인스턴스 변수는 스레드가 공유하는 힙에 존재하므로 제약이 없다.
    또한 일반적인 명령형 프로그래밍 패턴(병렬화를 방해하는 요소)에 제동을 걸 수 있다.
## 1.6 메서드 참조
    메서드 참조를 이용하면 기존의 메서드 정의를 재활용해서 람다처럼 전달을 할 수 있다.
    예를 들어 다음과 같은 코드를 가독성 좋게 바꿀수도 있다.
```java
inventory.sort((Apple a1, Apple a2) -> a1.getWeight().compareTo(a2.getWeight()));

inventory.sort(comparing(Apple:getWeight));
```   
    메서드 참조는 특정 메서드만을 호출하는 람다의 축약형이라고 생각할 수 있다.
    람다가 이 메서드를 호출하라고 지시하면 어떻게 호출하는지 설명을 보는것보다
    메서드명을 직접 참조하는 것이 편리하다. 메서드 참조는 메서드명 앞에 (::) 를
    붙이는 방식으로 메서드 참조를 활용할 수 있다.
 ```java
(Apple apple) -> apple.getWeight() : Apple::getWeight
() -> Thread.currentThread().dumpStack() : Thread.currentThread()::dumpStack
(str, i) -> str.substring(i) : String::substring
(String s) -> System.out.println(s) : System.out::println
(String s) -> this.isValidName(s) : this::isValidName
```
    메서드 참조는 3가지 유형으로 구분할수 있는데,
    첫번째 정적 메서드 참조로 Integer의 parseInt 메서드 Integer::parseInt
    로 표현할 수 있다,
    두번째 다양한 형식의 인스턴스 메서드 참조로 String의 length 메서드는 String::length
    로 표현할 수 있다.
    마지막으로 기존 객체의 인스턴스 메서드 참조로 Apple 라는 객체를 할당받은 apple 지역변수
    가 있고 Apple 에 getColor 이라는 메서드가 있다면 Apple::getColor 로 표현한다.
    컴파일러는 람다 표현식의 형식을 검사하던 방식과 비슷한 과정으로 메서드 참조가 주어진
    함수형 인터페이스와 호환하는지 확인한다. 즉, 메서드 참조는 콘텍스트의 형식과 일치해야한다,
    메서드 뿐만 아니라 ClassName::new 처럼 생성자의 참조도 만들수 있다.
    다음 코드는 Integer 를 포함하는 리스트의 각 요소를 Apple 생성자로 전달한다.
 ```java
List<Integer> weights = Arrays.asList(7, 3, 4, 10);
List<Apple> apples = map(weights, Apple::new);
public List<Apple> map(List<Integer> list, Function<Integer, Apple> f) {
    List<Apple> result = new ArrayList<>();
    for(Integer i : list) {
        result.add(f.apply(i));
    }
    return result;
}
```
    또한 인스턴스화하지 않고도 생성자에 접근할 수 있는 기능을 다음과 같이 응용할수도 있다.
 ```java
static Map<String, Function<Integer, Fruit>> map = new HashMap<>();
static {
    map.put("apple", Apple::new);
    map.put("orange", Orange::new);
}

public static Fruit giveMeFruit(String fruit, Integer weight) {
    return map.get(fruit.toLowerCase()).apply(weight);
}
```
## 1.7 람다 표현식을 조합할 수 있는 유용한 메서드
    Comparator, Function, Predicate 같은 함수형 인터페이스는 람다 표현식을
    조합할수 있도록 유틸리티 메서드를 제공한다. 이는 간단한 람다 표현식을 조합해
    복잡한 표현식을 만들수 있다.
    만일 다음과 같은 코드의 역정렬을 하고 싶다면 reverse 라는 디폴트 메서드를
    사용하면 된다. 또한 무게가 같을 경우 thenComparing 를 이용해 세컨드 정렬도 가능하다.
```java
Comparator<Apple> c = Comparator.comparing(Apple::getWeight);

inventory.sort(comparing(Apple::getWeight).reversed())

inventory.sort(comparing(Apple::getWeight)
    .reversed()
    .thenComparing(Apple::getCountry));
```
    Predicate 의 경우 or, and, negate(반전) 을 제공해준다,
    Function 은 andThen, compose 두 가지 디폴트 메서드를 제공하는데
    andThen 은 주어진 함수를 먼저 적용한 결과를 다른 함수의 입력으로 전달,
    compose 는 인수로 주어진 함수를 먼저 실행후 그 결과를 외부함수의 인수로 제공한다.
```java
Function<Integer, Integer> f = x -> x + 1;
Function<Integer, Integer> g = x -> x * 2;
Function<Integer, Integer> h = f.andThen(g);
int result = h.apply(1) <- 4

Function<Integer, Integer> f = x -> x + 1;
Function<Integer, Integer> g = x -> x * 2;
Function<Integer, Integer> h = f.compose(g);
int result = h.apply(1) <- 3
```
    
