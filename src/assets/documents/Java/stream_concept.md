***이 글은 모던 자바 인 액션을 참고해서 쓴 글입니다.***
# 1. 스트림 소개
## 1.0 개요
    거의 모든 자바 애플리케이션은 컬렉션을 만들고 처리하는 과정을 포함한다.
    대부분 비지니스 로직에는 요리를 그룹화한다든가 가장 값 싼 요리를 찾는다 하면 연산이 필요하다,
    그런데 SQL 질의의 경우 속성을 어떻게 필터링 할것인가에 대한 고민없이 
    SELECT * FROM Apple where color='red' 라고 하면 빨강 사과를 찾을 수 있다.
    또한 커다란 컬렉션을 처리하기위 해서는 멀티코어 아키텍처를 활용한 병렬로 컬렉션의 요소를
    처리해야한다. 그러나 이는 단순 반복 처리에 비해 복잡하고 어렵울 뿐만 아니라 디버깅도 어렵다.
    이를 자바 언어단에서 쉽게 답을 줄수 있는것이 스트림이다.
    
## 1.1 스트림이란 무엇인가?
    스트림은 자바 8 API 에 추가된 기능으로 선언형으로 컬렉션 데이터를 처리할수 있다. 여기서 말하는
    선언형은 SQL 질의와 같은 표현이다. 또한 스트림은 멀티스레드 코드를 구현하지 않아도 데이터를
    투명하게 병렬로 처리할 수 있다. 간단한 예시로 기존코드를 스트림을 이용해서 비교해보자
    아래는 400 칼로리 이하의 음식을 오름차순으로 정렬한 음식의 이름을 구현한 코드이다
```java
List<Dish> lowCaloricDishes = new ArrayList<>();
for (Dish dish : menu) {
    if (dish.getCalories() < 400) {
        lowCaloricDishes.add(dish);
    }
}
Collections.sort(lowCaloricDishes, new Comparator<Dish>() {
    public int compare(Dish d1, Dish d2) {
        return Integer.compare(d1.getCalories(), d2.getCalories());
    }
});
List<String> lowCaloricDishesName = new ArrayList<>();
for(Dish dish : lowCaloricDishes) {
    lowCaloricDishesName(dish.getName());
}
```
    다음은 스트림과 람다표현식을 이용한 코드이다
```java
List<String> lowCaloricDishesName = menu.stream()
    .filter(d -> d.getCalories() < 400)
    .sorted(comparing(Dish::getCalories))
    .map(Dish::getName)
    .collect(toList());
```
    위의 두코드를 비교해보면
    자바 8 부터는 선언형으로 코드를 구현할수 있다. if, for 등의 제어 블록을 사용할 필요없이
    '저칼로리 요리만 선택해' 와 같은 동작의 수행을 지정할 수 있다.
    또한 filter, sort, map 과 같은 여러 빌딩 블록연슨을 연결해 파이프라인을 만들어
    복잡한 연산을 쉽게 쪼갤수 있다. 여기서 filter( sorted, map, collect) 같은 연산은
    고수준 빌딩 블록으로 이루어져 있으므로 특정 스레딩 모델에 제한되지 않고 자유롭게
    사용할 수 있다. 추가로 이들은 단일 스레드 모델이 사용할 수 있지만 멀티코어 아키텍처를
    최대한 투명하게 활용할 수 있게 구현되어 있어, 데이터 과정을 병렬화 할때 스레드와 락을
    걱정할 필요가 없어졌다.
    
## 1.2 스트림 시작하기
    자바 8 컬렉션에는 스트림을 반환하는 stream 메서드가 추가됐다.
    스트림이란 '데이터 처리 연사을 지원하도록 소스에서 추출된 연속된 요소'로 정의할 수 있다.
    자세히 살펴보면 연속된 요소는 컬렉션과 마찬가지로 특정 요소 형슥으로 이루어진 연속된
    값 집합의 인터페이스를 제공하며, 컬렉션, 배열, I/O 자원 등의 데이터 제공 소스로 부터
    데이터를 소비하므로 정렬상태가 유지 할수 있다.
    추가로 스트림 연산끼리 파이프라인을 구성할수 있는데 이를 통해서, Laziness, Short-circuiting
    같은 최적화도 얻을 수 있다. 또한 명시적으로 반복하는 컬렉션과 달리 내부 반복을 지원한다.
    예제로 지금까지 내용을 보면
```java
List<String> threeHighCaloricDishNames = 
    menu.stream()
        .filter(d -> d.getCalories() < > 300)
        .map(Dish::getName)
        .limit(3)
        .collect(toList());
```
    우선 stream 메서드를 호출해서 스트림을 얻었다, 여기서 데이터 소스는 메뉴 리스트이다.
    데이터 소스는 연속된 요소를 스트림에 제공한다. 그 후에 데이터 처리 연산인 filter 를 적용해
    파이프라인을 형성할수 있도록 스트림을 반환한다. 마지막으로 collect 연산으로 파이프라인을
    처리해서 결과를 반환한다. collect 는 스트림이 아니라 List 를 반환하는데 collect 가
    호출되기 전까지 메서드 호출이 저장되는 효과가 있다.
    
## 1.3 스트림과 컬렉션
    기존 컬렉션과 새로운 스트림 둘다 연속된 요소 형식의 값을 저장하는 자료구조의 인터페이스를 
    제공한다. 여기서 연속된은 순차적으로 값에 접근한다는 것을 의미한다.
    둘의 차이점을 보면 데이터를 언제 계산하느냐가 가장 큰 차이점으로 볼수 있는데,
    컬렉션은 현재 자료구조가 포함하는 모든 값을 메모리에 저장하는 자료구조로, 모든 요소는
    컬렉션에 추가하기 전에 계산되어야 한다.
    반면에 스트림은 요청할 떄만 요소를 계산하는 고정된 자료구조로 요소를 추가하거나 삭제할 수 없다.
    또한 스트림은 반복자와 마찬기지로 한 번만 탐색이 아능한데, 이는 탐색된 스트림의 요소는 소비가
    된다는 뜻이다. 만일 한 번 탐색한 요소를 다시 탐색하려면 초기 데이터 소스에서 새로운 스트림을 
    만들어야 한다.
```java
Stream<String> s = list.stream();
s.forEach(System.out::println);
s.forEach(System.out::println); <- java.lang.IlegalStateException 스트림이 소비됬거나 닫힘
```
### 1.3.1 외부 반복과 내부 반복
    컬렉션은 사용자가 직접 요소를 for문 처럼 직접 반복시켜야하는데 이를 외부 반복이라고 한다.
    반면 스트림은 알아서 처리해 결과를 어딘가에 저장해주는 내부 반복을 사용한다.
```java
List<String> names = new ArrayList<>();
for (Dish dish : menu) {
    names.add(dish.getName());
}

List<String> names = menu.stream()
                        .map(Dish::getName)
                        .collect(toList());
``` 
    위의 코드와 같이 더 쉽게 반복할수 있다. 작업을 투명하게 병렬로 처리하거나 
    더 최적화된 다양한 순서로 처리할 수 있다. 반면 외부반복으로 이를 처리한다면,
    병렬성을 스스로 관리해야 하며 최적화를 달성하기가 어렵다.
    
## 1.4 스트림 연산
    스트림 연산은 크게 두가지로 나눌수 있는데 
    첫째로 filter, map, limit 와 같이 파이프라인을 형성할수 있는 연산(중간 연산)
    둘째로 collect로 파이프라인을 실행하는 연산(최종 연산) 으로 나눌수 있다.
    
    자세히 보면 중간 연산은 다른 스트림을 반환해서 이를 연결해 파이프라인을 만들수 있고,
    실행하기 전까지는 아무런 수행도 하지 않으므로 게이르다는 것이다.
    이를 통해 얻을수 있는 이점으로 limit 중간 연산을 사용할때 전체 요소를 앞서서 처리하는
    것이 아니라 쇼트서킷이라는 기법으로 인해 처음부터 3개만 선택된다.
    
    최종 연산은 파이프라인에서 결과를 도출하는 연산이다.
    
    
    
    