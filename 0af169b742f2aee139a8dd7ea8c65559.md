***이 글은 You Don't Know JS을 참고해서 쓴 글입니다.***
# 1. 프로토타입
## 1.1 [[Prototype]]
    명세에 따르면 자바스크립트 객체는 [[Prototype]]이라는 내부 프로퍼티가 있고, 다른 객체를 참조하는
    단순 래퍼런스로 사용한다. 거의 모든 객체가 이 프로퍼티에 null 아닌 값이 생성된 시점에 할당된다.
    myObject.a 처럼 객체 프로퍼티 참조시 [[Get]]은 기본적으로 객체 자체에 프로퍼티가 존재하는지 찾아보고
    존재하면 그 프로퍼티를 사용하는데, 프로퍼티가 없다면 다음 관심사가 이 객체의 [[Prototype]] 링크다.
```javascript
var anotherObject = {
    a: 2
};
// anotherObject 에 연결된 객체를 생성한다.
var myObejct = Object.create(anotherObject);

console.log(myObejct.a); // 2
```
    myObject는 anotherObject 와 [[Prototype]]이 링크됬다. 분명 myObject 에는 a 라는 프로퍼티가
    없지만 anotherObject에서 2라는 값을 대신 찾아 프로퍼티 접근의 결과값으로 반환한다.
    일치하는 프로퍼티명이 나올 때까지 아니면 [[Prototype]] 연쇄가 끝날 때까지 같은 과정이 반복된다.

## 1.1.1 Object.prototype
    [[Prototype]] 연쇄가 끝나는 지점은 내장 프로터타입 Object.prototype 에서 끝난다. 모든
    자바스크립트 객체는 Object.prototype 객체의 자손이므로 Object.prototype에는 자바스크립트
    에서 두루 쓰이는 다수의 공용 유틸리티가 포함되어 있다. (toString(), valueOf() 등등)

## 1.1.2 프로퍼티 세팅과 가려짐
    객체 프로퍼티 세팅은 단지 어떤 객체에 프로퍼티를 새로 추가하거나 기존 프로퍼티 값을 바꾸는 것
    이상의 의미가 있다. 다음 코드를 자세히 살펴보자 
```javascript
myObject.foo = "bar";
```
    foo 라는 이름의 평범한 데이터 접근 프로퍼티가 myObject 객체에 직속된 경우 이 할당문은
    단순히 기존 프로퍼티 값을 고치는 단순한 기능을 할 뿐이다.
    foo가 myObject에 직속된 프로퍼티가 아니면 [[Get]] 처럼 [[Prototype]] 연쇄를 순회하기 시작하고,
    그래도 foo가 발견되지 않으면 foo라는 프로퍼티를 myObject 객체에 추가한 후 주어진 값을 할당한다.
    foo가 [[Prototype]]의 상위 연쇄 어딘가에 존재하면 미묘한 일들이 벌어진다.
    foo라는 프로퍼티명이 myObject 객체와 이 객체를 기점으로 한 [[Prototype]] 연쇄의 상위 수준
    두 곳에서 동시에 발견될 때 이를 가려짐 이라 한다. myObject에 직속한 foo 때문에 상위 연쇄의 foo가
    가려지는 것이다. 이는 myObjcet.foo로 검색하면 언제나 연쇄의 최하위 수준에서 가장 먼저 foo 프로퍼티를
    찾기 때문이다.
    myObject에 직속한 foo는 없으나 myObject [[Prototype]] 연쇄의 상위 수준에 foo가 있을 때
    세가지 경우의 수가 따른다.
    1. [[Prototype]] 연쇄의 상위 수준에서 foo라는 이름의 일반 데이터 접근 프로퍼티가 존재하는데,
    읽기 전용이 아닐경우(writable:true) myObject의 직속 프로퍼티 foo가 새로 추가되어 가려짐 현상이 발생한다.
    2. [[Prototype]] 연쇄 상위 수준에서 foo가 읽기 전용(writable:false) 이면 조용히 무시되고,
    엄격모드에서는 에러가 발생한다. 어쨌든 겨라짐 현상은 발생하지 않는다.
    3. [[Prototype]] 연쇄 상위 단계에서 발견된 foo가 세터일 경우 항상 이 세터가 호출된다.
    즉, 가려짐 현상은 1번 경우에만 해당하는 얘기이다.
    여기서 주의할점은 2번 경우인데, [[Prototype]] 연쇄의 하위 수준에서 암시적으로 생성되지
    못하게 차단한다. 단지 쓰기 금지된 foo가 다른 객체에 있다는 이유만으로 봉쇄하는거는 다소 억지스럽다.
    가려짐은 그 이용 가치에 비해 애매한 구석이 있으니 사용하지 말자.(Delegation 파트 참고)
    더욱이 가려짐은 미묘하게 암시적으로 발생하는 경우도 있으니 주의해야 한다. 다음 코드를 보자
```javascript
var anoterObject = {
    a: 2
};
var myObject = Object.create(anoterObject);
console.log(myObject.hasOwnProperty('a')); // false

myObject.a++;

console.log(anoterObject.a); // 2
console.log(myObject.a); // 3

console.log(myObject.hasOwnProperty('a')); // true
```
    겉보기에는 myObject.a++가 anotherObject.a 프로퍼티를 찾아 1을 증가할거 같지만
    ++ 연산자는 결국 myObject.a = myObject.a + 1 을 의미한다. 따라서 [[Prototype]]을 경유하여
    [[Get]]을 먼저 찾고 anotherObject.a 에서 현재 값 2를 얻은 후 1을 증가하여 결과값 3을 얻고,
    [[Put]]으로 myObject에 가려짐 프로퍼티 a를 생성한 뒤 할당한다.
    그러므로 위임을 통해 프로퍼티를 수정할 땐 조심해야 한다.
    
## 1.2 클래스
    자바스크립트는 클래스 지향 언어에서 제공하는 클라스라는 추상화된 패턴이나 설계없이
    객체만 존재한다. 객체는 자신의 작동을 손수 정의한다.
    
### 1.2.1 클래스 함수
    자바스크립트의 희한한 특성 탓에 클래스처럼 생긴 뭔가를 만들어 쓰려는 꼼수가 남용되었다.
    이를 살펴보자. '일종의 클래스' 같은 독특한 작동은 모든 함수가 기본으로 프로토타입이라는
    공욜/열거 불가 프로퍼티를 가진다는 이상한 특성에 기인한다.
```javascript
function Foo(){}
console.log(Foo.prototype); // {}
```
    이 객체를 보통 Foo의 프로토타입 이라고 하는데, new Foo() 로써 만들어진 모든 객체는
    결국 이 객체와 [[Prototype]] 링크로 연결된다.
```javascript
function Foo() {};
var a = new Foo();
console.log(Object.getPrototypeOf(a) === Foo.prototype); // true;
```
    new Foo()로 a가 생성될 때 일어나는 네 가지 중 하나가 바로 Foo.prototype이 가리키는
    객체를 내부 [[Prototype]]과 연결하는 것이다.
    클래스 지향 언어는 클래스에서 여러 인스턴스를 다중 복사 할수 있지만, 자바스크립트는 
    이런 복사 과정이 전혀 없고, 여러 인스턴스를 생성할 수도 없다. 결과적으로
    자바스크립트에서 객체들은 서로 완전히 떨어져 분리되는 것이 아니라 끈끈하게 연결된다.
    즉, new Foo() 로 새 객체가 만들러지고, 이 객체는 Foo.prototype 객체와 내부적으로
    [[Prototype]] 과 연결이 맺어진다. 어떤 클래스로부터 작동을 복사하여 다른 객체에
    넣는 동작 따위는 하지 않는다. 
    
### 1.2.2 생성자
    앞의 예제를 다시 살펴보자
```javascript
function Foo(){}
console.log(Foo.prototype); // {}
```
    Foo 가 클래스 처럼 보이는 이유가 뭘까? 가장 먼저 new 키워드가 보이고, 클래스를 인스턴스화할 때
    진짜 클래스의 생성자가 호출되듯이 Foo() 메서드가 호출됐으므로 클래스 생성자 메서드를 실행하고
    있는 것처럼 보이는 건 맞다. 어쩌다 Foo.prototype이라는 이름이 붙은 객체가 속임수를 부리는 듯할
    때 생성자의 진의는 더 혼란스럽게 느껴진다. 다음 코드를 보자.
```javascript
function Foo() {};
console.log(Foo.prototype.constructor === Foo); // true

var a = new Foo();
console.log(a.constructor === Foo); // true
```
    Foo.prototype객체는 기본적으로 열거 불가한 공용 프로퍼티 .constructor가 세팅되는데,
    이는 객체 생성과 관련된 함수(Foo) 를 다시 참조하기 위한 래퍼런스다.
    마찬가지로 new Foo()로 생성한 객체 a도 .constructor 프로퍼티를 갖고 있어 자신을 생성한
    함수를 가리킬 수 있다.
    
    앞 예제에서 new를 붙여 Foo 함수를 호출하고 객체가 생성됬으니 Foo 를 생성자로 보고 싶을 것이다.
    그러나 Foo는 함수일 뿐이다. new 키워드는 일반 함수 호출을 도중에 가로채어 객체 생성이라는
    잔업을 더 부과하는 지시자일 뿐이다.
```javascript
function NothingSpecial() {
    console.log('Nothing');
}
var a = new NothingSpecial();
console.log(a); // {}
```
    NothingSpecial은 평범한 함수이지만 new로 호출함으로써 객체가 생성된다. 이를 생성자 호출이라고
    말하지만 함수 자체는 생성자가 아니다.
    
    많은 자바스크립트 개발자가 클래스 지향을 흉내내기 위해 많은 노력을 기울여 왔따.
```javascript
function Foo(name) {
    this.name = name;
}

Foo.prototype.myName = function () {
    return this.name;
}

var a = new Foo('a');
var b = new Foo('b');

console.log(a.myName()); // a
console.log(b.myName()); // b
```
    이 예제는 두 가지 클래스 지향 꼼수를 썼다.
    1. this.name = name 할당 시 .name 프로퍼티가 a,b 두 객체에 추가된다. 마치 클래스 인스턴스에서
    데이터값을 캡슐화하는 모습처럼 보인다.
    2. Foo.prototype.myName = ... 부분이 흥미로운 기법으로 함수를 Foo.prototype 객체에 추가한다.
    그래서 a.myName() 처럼 쓸 수 있다.
    Foo.prototype 객체의 프로퍼티/함수가 a,b 생성 시 각각의 객체로 복사되는 것처럼 보이지만
    실제로는 a,b 는 생성 직후 각자의 내부 [[Prototype]]이 Foo.prototype에 링크된다.
    myName는 a,b 에서 찾을 수 없으므로 위임을 통해 Foo.prototype 에서 찾는다.
    
    다시 .constructor 프로퍼티를 보자 a.constructor === Foo 가 true임은 a에 Foo를 참조하는
    .constructor라는 프로퍼티가 실재함을 의미할까? 아니다 실은 .constructor 역시 
    Foo.prototype에 위임된 레퍼런스로서 a.constructor는 Foo를 가리킨다.
    Foo에 의해 생성된 객체 a가 .constructor 프로퍼티를 통해 Foo에 접근하는것은 언뜻 편해보이지만,
    보안 측면에서는 바람직하지 않다. a.constructor 가 Foo 를 참조하는건 행운이다.
    Foo.prototype의 .constructor 프로퍼티는 기본으로 선언된 Foo 함수에 의해 생성된 객체에만
    존재한다. 새로운 객체를 생성한 뒤 기본 .prototype 객체 레퍼런스를 변경하면 어떻게 될까?
```javascript
function Foo() {};
Foo.prototype = {};

var a1 = new Foo();
console.log(a1.constructor === Foo); // false
console.log(a1.constructor === Object); // true
```
    분명 Object()가 a1을 생성한 게 아니라 Foo()가 a1을 생성한 것으로 보인다.
    어떤게 된것일까? a1 에는 .constructor 프로퍼티가 존재하지 않으므로 [[Prototype]] 연쇄를 따라
    올라가 Foo.prototype 객체에 위임한다. 하지만 이 객체도 .constructor 프로퍼티가 없으므로 결국
    Object.prototype 객체에 이르게 된다. 즉, 내장 Object() 함수를 가리키게 되는것이다.
    한가지만 기억하면 될것이다. .constructor 는 불변 프로퍼티가 아니라 쓰기가 가능하며
    덮어 쓰기가 가능하므로 .constructor 프로퍼티가 애초 예쌍과 다른 전혀 다른 객체를 가리킬 수도 있다.
    가능하면 직접 사용하지 않는 게 상책이다.
    
## 1.3 프로토타입 상속
    앞서 a가 Foo.prototype에서 상속하여 myName() 함수에 접근했던 걸 상기하면 프로토타입 상속이라는
    체계가 어떻게 작동하는지 알 수 있다. 그러나 예전부터 보통 상속이라 하면 일단 두 클래스 간의
    고간계를 생각하지 클래스와 인스턴스 간의 관계를 떠올리진 않는다.
    다음은 위임 링크를 생성하는 전형적인 '프로토타입 스타일' 코드다
```javascript
function Foo(name) {
    this.name = name;
}

Foo.prototype.myName = function() {
    return this.name;
};

function Bar(name, label) {
    Foo.call(this, name);
    this.label = label;
}
//Bar.prototype 를 Foo.prototype 에 연결한다.
Bar.prototype = Object.create( Foo.prototype );
// 이제 Bar.prototype.constructor 은 사라졌으니 이 프로퍼티에 의존하는 코드가 있다면 수정해야한다.
Bar.prototype.myLabel = function() {
    return this.label;
}

var a = new Bar('a', 'obj a');
console.log(a.myName()); // a
console.log(a.myLabel()); // obj a
console.log(a.constructor === Foo); // true
```
    Bar.prototype = Object.create( Foo.prototype ) 부분이 중요하다.
    Object.create() 를 실행하면 새로운 객체를 만들고 내부 [[Prototype]]을 지정한 객체에 링크한다.
    Bar() {} 함수를 선언하면 Bar는 여타 함수처럼 기본으로 .prototype 링크를 자신의 객체에 가지고있다.
    그리고 연결된 객체와 헤어지고 Foo.prototype과 연결된 새로운 객체를 생성한다.
    그냥 다름 코드처럼 하면 되지 않을까? 라는 생각이 들수도 있다.
```javascript
// (1)
Bar.prototype = Foo.prototype;

// (2)
Bar.prototype = new Foo():
```
    (1)처럼 할당한다고, Bar.prototype이 링크된 새로운 객체가 생성되진 않는다. 단지 Bar.prototype을
    Foo.prototype을 가리키는 부가적인 레퍼런스로 만들어 사실상 Foo에 링크된 Foo.prototype 객체와
    직접 연결한다. 그래서 Bar.prototype.myLabel = ... 같은 할당문을 실행하면
    별도의 객체가 아닌 공유된 Foo.prototype 객체 자체를 변경하게 되어 Foo.prototype와 연결된
    모든 객체에 영향을 끼친다.
    
    (2)의 경우 Foo.prototype과 링크된 새 객체가 생성되지만, 그 과정에서 Foo()를 생성자 호출한다.
    Foo 함수 본문이 내부적인 부수 효과(로깅, 상태변경 등)로 가득하다면 연결고리가 성립되는 시점에
    이런 부수 효과까지 함께 일어나게 된다.
    그러므로 Foo()의 부수 효과가 일어나지 않도록 Object.create() 를 잘 사용해서
    새로운 객체를 적절히 링크하여 생성하야 한다.
    다음은 Bar.prototype 과 Foo.prototype을 연결하는 테크닉을 ES6 기준으로 나눈 코드다.
```javascript
// ES6 이전
// 기존 기본 'Bar.prototype' 를 던져 버린다. 그 후 던져버린 객체를 가비지 콜렉트
Bar.prototype = Object.create( Foo.prototype );

// ES6 이후
// 기존 'Bar.prototype' 를 수정한다.
Object.setPrototypeOf( Bar.prototype, Foo.prototype );
```

### 1.3.1 클래스 관계 조사
    a 같은 객체가 어떤 객체로 위임할지는 어떻게 알 수 있을까? 클래스 지향 언어에서는 인스턴스의
    상소 계통을 살펴보는것을 리플렉션 이라고 한다.
    우선 클래스라는 혼란을 수용하는 방법이 있다.
```javascript
function Foo() {};

Foo.prototype.blah = function() {};

var a = new Foo();
console.log(a instanceof Foo); // true
```
    instanceof 연산자는 a의 [[Prototype]] 연쇄를 순회하면서 Foo.prototype가 가리키는
    객체가 있는지 조사한다. 이 말은 대상 함수에 대해 주어진 객체의 계통만 살펴볼수 있다는 뜻이다.
    만일 객체 a,b 가 있으면 instanceof 만으로 두 객체가 서로 [[Prototype]] 연쇄를 통해
    연결되어 있는지 전혀 알 수 없다. 만일 클래스와 instanceof 의 의미를 오해하면
    다음과 같은 코드를 통해 억지로 추론하는 우를 범하게 된다.
```javascript
function isRelatedTo(o1, o2){
    function F(){}
    F.prototype = o2;
    return o1 instanceof F;
}

var a = {};
var b = Object.create(a);

console.log(isRelatedTo(b,a)); // true;
``` 
    임시로 생성한 함수 F의 .prototype이 멋대로 o2 객체를 참조하게 하고 o1이 F의 인스턴스인지
    물어보고 있다. 이는 instanceof 를 사용해 클래스 본래 의미를 자바스크립트에 강제로 적용하려는
    부자연스러움이 있다.
    [[Prototype]] 리플렉션을 확인할 수 있는 훌륭한 대안이 있다.
```javascript
Foo.prototype.isPrototypeOf(a) // true
``` 
    isPrototypeOf() 는 a의 전체 [[Prototype]] 연쇄에 Foo.prototype이 있는가 라는 질문에 대답한다.
    isPrototypeOf 를 쓰면 간접적으로 참조할 함수의 .prototype 프로퍼티를 거치는 등 잡다한 과정이
    사라진다. 다음과 같이 관계를 확인하고 싶은 객체 2개를 적어주기만 하면 된다.
```javascript
b.isPrototypeOf(c);
```
    따라서 함수는 전혀 필요하지 않다. 이는 마치 isRelatedTo() 유틸리티를 isPrototypeOf()라는 이름
    으로 자바스크립트 언어에 내장시킨 것이다.
    ES5 부터 지원하는 표준 메서드를 사용하면 [[Prototype]]을 곧바로 조회 할 수도 있다.
```javascript
console.log(Object.getPrototypeOf(a) === Foo.prototype); // true
```
    거의 모든 브라우저에서 내부의 [[Prototype]]을 들여다볼 수 있는 비표준 접근 방법을
    과거부터 지원해왔다.
```javascript
console.log(a.__proto__ === Foo.prototype); // true
```
    .__proto__ 프로퍼티(ES5까지는 비표준이다) 로 객체 내부의 [[Prototype]]을 볼 수 있다.
    프로토타입 연쇄를 직접 확인하고 싶을때는 체이닝도 가능하다.
    이미 앞에서 살펴본 .constructor 처럼 .__proto__ 역시 객체에 실제하는 프로퍼티가 아닌
    내장 객체 Object.prototype에 존재한다. 그리고 .__proto__는 프로퍼티처럼 보이지만
    게터/세터에 가깝다. 만일 구현한다면 .__proto__는 대략 다음과 같은 모습일 것이다.
```javascript
Object.defineProperty(Object.prototype, "__proto__", {
   get: function() {
        return Object.getPrototypeOf(this);   
   },
   set: function(o) {
     // ES6부터는 setPrototypeOf()를 사용한다.
     Object.setPrototypeOf(this, o);
     return o;
   }
});
```
    따라서 a.__proto__로 접근하는 것은 마치 a.__proto__()를 호출하는 것과 같다.
    .__proto__ 프로퍼티는 ES6 Object.setPrototypeOf()를 사용하여 세팅할 수도 있지만
    이미 존재하는 객체의 [[Prototype]]은 되도록 변경하지 않는 편이 좋다.
    일반 프로그래밍 관점에서 그리 바람직하지 않을 뿐더러 대개 난해하고 관리하기 어려운
    코드로 변질되는 경우가 많다.
    
## 1.4 객체 링크
    [[Prototype]] 체계는 다름 아닌 다른 객체를 참조하는 어떤 객체에 존재하는 내부 링크다.
    이 연결고리는 객체의 프로퍼티/메서드를 참조하려고 하는데, 해당 프로퍼티.메서드가 객체에 존재하지
    않을 때 활용된다. 엔진은 [[Prototype]]에 연결된 객체를 하나씩 따라가면서 프로퍼티/메서드를 
    찾아보고 발견될 때까지 같은 과정을 되풀이한다. 이렇게 객체 사이에 혈성된 일련의 링크를
    프로토타입 연쇄 라고 한다.

### 1.4.1 링크 생성
    [[Prototype]] 체계의 핵심은 무엇일까? 먼저 Object.create() 살펴보자
    이는 새로운 객체를 생성하고 주어잔 객체와 연결한다. (만일 주어진 객체가 null 일 경우
    프로토타입 연쇄가 존재하지 않기에 일차원적인 데이터 저장소로 사용하며 이를 딕셔너리라고 한다.)
    이 덕분에 클래스 뭉치 없이도 깔끔하게 처리할 수 있다.
    
    Object.create() 는 ES5부터 추가되어서 이전 버전을 지원하려면 폴리필이 필요하다.
```javascript
if(!Object.create) {
    Object.create = function(o) {
        function F() {}
        F.prototype = o;
        return new F();
    };
}
```
    이 폴리필은 우선 임시 함수 F를 이용하여 F.prototype 프로퍼티가 링크하려는 객체를 가리키도록
    오버라이드 한다. 그럼 다음 new F()로 원하는 연결이 수립된 새 객체를 반환한다.
    하지만 Object.create 의 추가적인 기능까지는 폴리필 할수 없다. 다음의 Object.create 의 추가기능이다.
```javascript
var anotherObject = {
    a: 2
};

var myObject = Object.create( anotherObject, {
    b: {
        enumerable: false,
        writable: true,
        configurable: false,
        value: 3     
    },
    c: {
        enumerable: true,
        writable: false,
        configurable: false,
        value: 4
    }
});

console.log(myObject.hasOwnProperty('a')); // false
console.log(myObject.hasOwnProperty('b')); // true
console.log(myObject.hasOwnProperty('c')); // true

console.log(myObject.a); // 2
console.log(myObject.b); // 3
console.log(myObject.c); // 4
```

## 1.4.2 링크는 대비책?
    지금까지 설명한 객체 간 연결 시스템을 프로퍼티/메서드를 찾지 못할 경우를 위한 대비책으로 오해하기 쉽다.
    이는 코드 분석이나 유지 보수에 힘겨운 소프트웨어가 될수 있다.
    이는 다음과 같이 활용하여 유지 보수까지 고려할수 있다.
```javascript
var anotherObject = {
    cool: function() {
        console.log('cool');
    }
};

var myObject = Object.create(anotherObject);
myObject.doCool = function(){
    this.cool(); // 내부 위임이다.
};
myObject.doCool(); // cool
```
    이는 내부적으로 [[Prototype]]을 anotherObject.cool() 에 위임한 위임 디자인 패턴의 구현 방식이다.
            