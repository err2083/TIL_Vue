***이 글은 자바스크립트 닌자 비급을 참고해서 쓴 글입니다.***
# 1. 객체 지향과 프로토타입
## 1.0 개요
    자바스크립트에서 프로토타입은 객체의 프로퍼티를 정의하고, 객체의 인스턴스에 자동으로
    적용되는 기능을 정의하는 편리한 수단이다. 프로토타입에 프로퍼티를 정의하면, 인스턴스 객체
    또한 그 프로퍼티를 갖게 된다.

## 1.1 인스턴스 생성과 프로토타입
    모든 함수에는 prototype 프로퍼티가 있고, 이 prototype 프로퍼티는 처음에는 빈 객체를 참조한다.
    만약 함수를 생성자로 사용하지 않는다면 이는 그다지 쓸모없다.
    먼저 객체 인스턴스 생성을 살펴보자
    new 연산자를 사용하는 경우와 그렇지 않은 두가지 간단한 코드를 살펴보자
```javascript
function Star() {}

Star.prototype.light = function() {
    return true;
}

var sun = Star();
var lunar = new Star();

console.log(sun); // undefined
console.log(lunar); // Star
console.log(lunar.light()); // true
```
    코드를 보면 먼저 아무일도 안하는 빈 함수를 선언하고 이 함수의 prototype에 메서드를 추가한다.
    그리고 일반 호출 형태와 생성자로 호출한후 반환값을 출력해본다.
    일반적인 호출 형태는 반환값이 없으므로 undefined 가 나오지만
    new 연산자를 함수는 새로운 객체가 생성되고 이 객체가 함수의 콘텍스트로 설정된다.
    그리고 이 인스턴스는 앞서 선언한 prototype 프로퍼티에 light 메서드가 
    존재하는것을 확인할 수 있다. 이는 함수의 프로토타입이 새로운 객체 생성을 위한
    일종의 청사진 역활을 하며, 생성자 함수의 prototype 프로퍼티에 메서드를 추가하면
    새로 만들어진 객체에 덧붙여지는것을 알 수 있다.
    그럼 인스턴스 메서드가 있다면 우선순위는 어떻게 될까?
    코드를 살펴보자
```javascript
function Star() {
    this.sun = false;
    this.light = function(){
        return !this.sun;
    };
}

Star.prototype.light = function() {
    return this.sun;
}

var lunar = new Star();
console.log(lunar.light()); // true
```
    코드를 통해 프로토타입 메서드와 인스턴스 메서드가 동일한 이름이지만
    콘솔의 결과는 인스턴스 메서드를 따라가는것을 확인할수 있다.
    즉, 객체를 생성자로 만들어진 인스턴스의 초기화 순서는
    1. 프로토타입의 프로퍼티들이 새로 만들어진 객체 인스턴스와 바인딩한다.
    2. 생성자 함수 내에서 정의한 프로퍼티들이 객체 인스턴스에 추가된다.
    로 확인할 수 있다.
    그런데 앞선 예제를 보면 함수를 생성자 함수로 호출할때 프로토타입이 지닌
    프로퍼티가 새로운 객체에 복사되는것처럼 보인다.
    그럼 다음 코드를 한번 살펴보자
```javascript
function Star(){
    this.light = true;
}

var sun = new Star();

Star.prototype.lunar = function(){
    return this.light;
}

console.log(sun.lunar()); // true
```
    만일 프로토타입이 지닌 프로퍼티가 생성 시점에 복사된다면 생성 이후에
    프로토타입에 정의한 프로퍼티를 참조할수 없을것이지만
    코드를 보면 문제없이 동작하는것을 확인할 수 있다.
    실제로 객체의 어떤 프로퍼티를 참조할 때 해당 객체가 그 프로퍼티를 직접
    소유한 게 아니라면, 프로토타입에서 그 프로퍼티를 찾는다.
    이 모든것이 어떻게 동작할까?
    변수는 객체를 가리키며 객체는 constructor 프로퍼티를 통해 생성자 함수와
    연결되고, 생성자 함수는 prototype 프로퍼티를 통해 프로토타입 객체를 가리킨다.
    constructor 라는 프로퍼티는 자바스크립트 모든 객체에 암묵적으로 존재하며,
    이 프로퍼티는 그 객체를 만드는 데 사용한 생성자를 참조한다.
    그리고 프로토타입은 생성자의 프로퍼티이기 때문에 모든 객체는 자신의 프로토타입을
    찾을수 있다.
    위 코드에서 다음 코드를 실행해보면 생성자 함수와 프로토타입 프로퍼티를 확인할 수 있다.
```javascript
console.log(sun.constructor);
console.log(sun.constructor.prototype.lunar);
```
    이는 객체가 만들어진 이후에 프로토타입에 변경한 프로퍼티에 객체가 접근할수 있는지를
    알수 있는 부분이다.
    그럼 인스턴스 메서드가 존재할때 같은 이름의 프로토타입 메서드를 정의하면 어떻게 될까?
    인스턴스에서 프로퍼티에 참조할때 직접적으로 가지고 있지 않을때면 프로토타입 프로퍼티를
    참조하므로 인스턴스 메서드가 우선하는것을 잊지 말자.
    
    자바스크립트는 언제 프로토타입을 사용하는지 알아두어야 하지만, 어떤 함수가
    객체 인스턴스를 생성했는지 아는것도 유용하다.
    객체의 생성자는 constructor 프로퍼티를 통헤 얻을 수 있다.
````javascript
function Star() {}
var star = new Star();
console.log(typeof star == "object"); // true
console.log(star instanceof Star); // true
console.log(star.constructor == Star); // true
````
    코드를 보면 객체 인스턴스 타입을 확인하고 있다.
    첫번째 방법인 typeof 는 인스턴스 객체에 대해 항상 'object' 를 반환하므로
    많은 정보를 얻지 못한다.
    보다 흥미로운 두번째는 어떤 생성자 함수를 사용하여 인스턴스를 만들었는지
    확인할수 있다. 하지만 
    세번째 방법은 인스턴스가 어디로부터 왔는지 역으로 참조하기 때문에
    원본 생성자 함수를 직접 접근하지 않더라도 인스턴스를 만들수 있다.
```javascript
function Star() {}
var star = new Star();
var star2 = new star.constructor();
```
    앞에서 본 instanceof 연산자를 살펴보자
    이는 객체 상속과 관련하여 또 다른 유용한 기능을 제공하는데. 먼저
    상속과 프로토타입 체인을 이해하여야 한다.
```javascript
function Star() {};
Star.prototype.tear = function() {};

function Light() {};
Light.prototype = { tear: Star.prototype.tear};

var light = new Light();
console.log(light instanceof Light); // true
console.log(light instanceof Star); // false
console.log(light instanceof Object); // true
```
    함수의 프로토타입도 객체이기 때문에, 상속 효과를 내도록 Star 프로토타입의
    메서드인 tear 프로퍼티를 Light 프로토타입에 복사함으로써 상속을 구현한다.
    그러나 light instanceof Star 는 실패하는 것이 이는 상속이 아닌 단지
    복사하는 점을 알수 있다.
    여기서 필요한것은 프로토타입 체인으로, 이를 이용해서 상속을 구현할수 있다.
    프로토타입 체인을 생성하는 제일 좋은 방법은 상위 객체의 인스턴스를 하위 객체의
    프로토타입으로 사용하는 것이다.
    SubClass.prototype = new SuperClass();
    subClass 인스턴스의 프로토타입은 SuperClass 의 인스턴스 이고,
    SuperClass 의 인스턴스는 SuperClass 의 프로토타입을 갖고 있으며
    SuperClass 의 프로토타입은 SuperClass 의 모든 프로퍼티가 있다.
    이런식으로 하위 클래스의 프로토타입은 상위 클래스의 인스턴스를 가리킨다.
```javascript
function Star() {}
Star.prototype.tear = function() {};
function Light() {}
Light.prototype = new Star();
var light = new Light();

console.log(light instanceof Light); // true
console.log(light instanceof Star); // true
console.log(light instanceof Object); // true
console.log(typeof light.tear == 'function'); // true 
```
    코드를 보면 instanceof 연산을 수행하면 함수가 자신의 프로토타입 체인
    내에 있는 어떤 객체의 기능을 상속하고 있는지를 확인 할수 있다.
    참고로 Star.prototype = Light.prototype 같은 방법은 지양하는 형태이다
    이는 Star 프로토타입에 일어나는 모든 변경사항이 Light 프로토타입에도 적용
    되므로 예상치못한 부작용을 초래할 수 있다.
    
    이를 응용하면 네이티브 객체(Array, String ..) 의 기능을 확장 할 수도 있다.
```javascript
if(!Array.prototype.forEach){
    Array.prototype.forEach = function(callback, context) {
        for (var i = 0; i < this.length; i++) {
            callback.call(context || null, this[i], i, this);
        }
    }
}
```
    모든 내장 객체에도 프로토타입이 있기 때문이 위 코드와 같이 확장을 할수있다.
    그러나 내장 객체 프로토타입은 언제나 하나이기 때문에 충동일 날 가능성이
    있으니 위험하다는 것을 인지하여야 한다.
    또 모든 DOM 엘리먼트가 HTMLElement 생성자를 상속한다는 것.
    우리는 HTMLElement 프로토타입에 접근할수 있고, HTML 노드도
    선택에 따라 확장 할 수있다.
```javascript
HTMLElement.prototype.remove = function(){
    if (this.parentNode) {
        this.parentNode.removeChild(this);
    }
}

document.getElementById("a").remove();
```
    이를 이용할때 주의할점은 IE8 이하는 HTMLElement 프로토타입을 지원하지
    않는다는 점이다. 또힌 HTMLElement 는 생성자를 호출하는 기능은 작동하지 않는다.
    var el = new HTMLElement();
    
## 1.2 실수하기 쉬운 것들
    프로토타입, 인스턴스 생성, 상송과 관련해서 여러가지 실수하기 쉬운 예를 살펴보자
### 1.2.1 객체 확장하기
    프로토타입을 다루면서 가장 최악의 실수는 Object.prototype 의 확장이다.
    이는 모든 객체가 추가된 프로퍼티를 받으면서, 순회할때 새로 추가한 프로퍼티가 같이
    순회되어 문제가 될수 있고, 예상치못한 행동을 발생시킬수 있다.
    코드를 보면서 이해해보자, 다음 코드는 객체의 모든 프로퍼티 이름을 반환하는 함수를
    구현한 것이다.
```javascript
Object.prototype.keys = function(){
    var keys = [];
    for (var p in this) keys.push(p);
    return keys;
}

var obj = {a: 1, b:2, c: 3};

console.log(obj.keys()); // a, b, c, keys
```
    결과를 보면 obj 에 요소 3개를 추가했지만 출력을 보면 keys 까지 출력된것을 볼수 있다.
    Object 에 추가한 메서드는 모든 객체에 영향을 주고, 모든 객체는 추가한 메서드를
    신경쓸수 바께없다. 이에 대한 대안으로
    자바스크립트는 프로퍼티가 실제로 객체 인스턴스에 정의된것인지, 프로토타입에서
    온것인지를 판단해주는 hasOwnProperty() 메서드를 제공한다.
```javascript
Object.prototype.keys = function(){
    var keys = [];
    for (var p in this){
        if (this.hasOwnProperty(p)) keys.push(p);   
    }
    return keys;
}

var obj = {a: 1, b:2, c: 3};

console.log(obj.keys()); // a, b, c
```
    하지만 이런 해결책이 있다고 해서 남용해도 된다는 뜻은 아니다.
    hasOwnProperty() 를 사용하는 경우는 일반적이지 않다.
    이는 일반적이지 않는 상황에서 보호하기 위해 이같은 해결책을 사용할 뿐이다.

### 1.2.2 Number 객체 확장하기
    Object를 제외한 대부분의 네이티브 객체 프로토타입을 확장하는 방식은 안전하다.
    하지만 본질적으로 Number 객체는 문제가 될수 있다.
    자바스크립트 엔진이 숫자와 숫자 객체의 프로퍼티를 파싱하는 방법때문에 
    혼란을 초래할 수도 있다.
```javascript
Number.prototype.add = function(num){
    return this + num;
};
var n = 5;
console.log(n.add(3)); // 8
console.log((n).add(3)); // 8
console.log(5.add(3)); // error
```
    위 코드를
    1. 변수를 이용하여 메서드를 테스트
    2. 표현식 형태를 테스트
    3. 숫자 리터럴을 직접 사용하여 테스트
    하지만 문법 파서가 리터럴의 경우 처리하지 못해 에러가 발생한다.
    Number 프로토타입을 건드리는것은 선택하항이지만 이런 상황을 제어할줄 알아야한다.

### 1.2.3 네이티브 객체의 하위 클래스 만들기
    네이티브 객체의 하위 클래스를 만들려고 하면, 상황이 조금 불명확해진다.
    예를 들면 Array의 하위 클래스를 만들면, 우리가 기대한것처럼 아무 문제없이
    동작하는 것처럼 보일지도 모른다
```javascript
function MyArray() {};
MyArray.prototype = new Array();
var mine = new MyArray();
mine.push(1,2,3);
console.log(mine.length); // 3
console.log(mine instanceof Array); // true
```
    이 코드를 익스플로러에서 불러오지 않는다면 문제가 없어보인다.
    length 프로퍼티는 약간 특별하고 Array 객체의 숫자 인덱스와 밀접한
    관계가 있다. IE 에서는 length 프로퍼티와 관련한 것들을 원활하게 사용하지
    못하기 때문에, IE는 우리의 의도에 잘 따라주지 않는다(IE 9 이상은 제대로 동작)
    이런 상황에서는 네이티브 객체 전체를 상속하기 보다는 네이티브 객체의 기능과는
    별개인 기능을 구현하는 것이 더 나은 전략이다.
```javascript
function MyArray() {};
MyArray.prototype.length = 0;

(function(){
    var methods = ['push', 'pop', 'shift', 'unshift', 'slice', 'splice', 'join'];
    
    for (var i = 0; i < methods.length; i++) (function(name){
        MyArray.prototype[name] = function(){
            return Array.prototype[name].apply(this, arguments);
        }
    })(methods[i]);
})();

var mine = new MyArray();
mine.push(1,2,3);
console.log(mine.length); // 3
console.log(mine instanceof Array); // false
```
    여기서는 Array 를 상속하는 대신 즉시실행함수를 사용하여 선택한 메서드만
    apply 를 통해 MyArray 클래스에 추가하는 형태로 사용했다.
    
### 1.2.4 인스턴스 생성 이슈
    일반 함수와 생성자 이는 다르게 동작하는것을 이미 알고 있을것이다.
    누군가 잘못된 방식으로 함수를 사용한 경우, 발생할 수 있는 문제점들을
    살펴보자
```javascript
function User(first, last) {
    this.name = first + last;
}
var user = User('star','light');
console.log(user); // undefined
console.log(user.name); // error
```
    코드를 보면 첫번쨰 콘솔에서 undefined 가 출력된것을 보면
    인스턴스가 생성조차 안된것을 볼 수 있다.
    코드를 자세히 보지않으면 User 에 new 가 빼먹은 것인지 확실히 알기 어렵다.
    특히 초보자는 new 연산자를 생략한 채로 호출하기 쉽고, 예상치 못한 결과가
    나올수도 있다. 위 코드의 경우 User 를 일반 함수로 호출했으니 this 가 전역
    이 되고 현재 유효 범위를 오염시킨다. (name 전역변수가 덮어쓴다)
    그럼 어떻게 생성자로 함수를 호출했는지 확인할까?
```javascript
function Test(){
    return this instanceof arguments.callee;
}
console.log(Test()); // false
console.log(new Test()); // object
```
    이 코드를 통해 몆가지 중요한 개념을 떠올려보자
    첫째, arguments.callee 를 통해 현재 실행하고 있는 함수에 대한 참조를
    얻을 수 있다.(권장하지 않는 방법)
    둘째, '일반적인' 함수의 콘텍스트는 전역 유효 범위 이다.
    셋째, 생성된 객체에 대해 instanceof 연산자를 사용하여 그 객체의 생성자를
    테스트 할 수 있다.
    이를 통해 new 를 명시적으로 호출하게 코드를 다시 짜보자
```javascript
function User(first, last) {
    if (!(this instanceof arguments.callee)) {
        return new User(first, last);
    }
    this.name = first + last;
}
```
    하지만 이는 과연 옳은가에 대해 의문을 가져야한다.
    앞서 말했듯이 arguments.callee 는 strict 모드에서 금지되고,
    사용자의 의도를 100% 확신할 수도 없고, 모든 클래스에 이런 형태로
    코드를 넣어줄수도 없는 노릇이다. 이런 부분을 항상 고민 해보자
    
## 1.3 보다 클래스다운 코드 작성하기
    전통적인 객체 지향 방식에 익숙한 개발자들에게 자연스럽게 다가갈수 있는
    코드를 한번 보자
```javascript
var Person = Object.subClass({
    init: function(isDancing){
        this.dancing= isDancing;
    },
    dance: function(){
        return this.dancing;
    }
});

var Star = Person.subClass({
    init: function(){
        this._super(false);
    },
    dance: function(){
        return this._super();
    },
    swingSword: function(){
        return true;
    }
});

var person = new Person(true);
console.log(person.dance());

var star = new Star();
console.log(star.swingSword());
console.log(star.dance());

console.log(person instanceof Person);
console.log(star instanceof Star && star instanceof Person);

(function(){
    var initializing = false,
        superPattern = /xyz/.text(function(){ xyz;}) ? /\b_super\b/ : /.*/;
    
    Object.subClass = function(properties){
        var _super = this.prototype;
        
        initializing = true;
        var proto = new this();
        initializing = false;
        
        for (var name in properties){
            proto[name] = typeof properties[name] == 'function' 
            && typeof _super[name] == 'function'
            && superPattern.test(properties[name]) ?
            (function(name, fn) {
                return function() {
                  var tmp = this._super;
                  this._super = _super[name];
                  var ret = fn.apply(this, arguments);
                  this._super = tmp;
                  return ret;
                };
            })(name, properties[name]) : properties[name];
        }
        function Class(){
            if (!initializing && this.init)
                this.init.apply(this, arguments);
        }
        Class.prototype = proto;
        Class.constructor = Class;
        Class.subClass = arguments.callee;
        
        return Class;
    };
})();
```
    위 코드를 볼때 중요한 점을 정리해보자
    첫째 상위 클래스의 생성자 함수에 있는 subClass() 메서드를 호출하여
    새로운 클라새를 만든다. 코드는 Object 로 부터 Person, Person 으로 부터 Star
    둘째 우리는 생성자를 단순한 방법으로 만들기 원한다. 각 클래스에 init 메서드를 선언하면 된다.
    셋째 우리가 만든 모든 클래스는 Object 를 상속한다. 즉, 어떤 클래스의 최상위 계층은
    Object 가 있어야 한다.
    마지막으로 이러한 문법들이 해결해야 할 문제는 적절한 콘텍스트를 설정하여
    재정의된 메서드에 접근을 가능케 하는 것이다. 이를 위해 this._super() 를
    사용하여 Person에 있는 원본 init() 와 dance() 메서드를 호출하는지 볼수 있다.
    위 코드는 상당한 난이도가 있으므로 각 부분별로 살펴보자
    요점을 먼저 보자면 가장 중요한 두가지는 초기화 와 상위 클래스에 정의된
    메서드를 하위 클래스에서 재정의할 떄의 처리 방법이다.
    
### 1.3.1 함수 직렬화 검사
    함수 직렬화는 어떤 함수를 받아서 단순히 그 함수 내용을 텍스트로 돌려 받는것이다.
    나중에, 우리가 처리해야 할 참조가 특정 함수 내부에 있는지를 검사하려면 이 방법이 필요하다.
    일반적으로 문자열을 요구하는 콘텍스트에서 함수의 toStirng() 메서드가 호출됨
    으로써 해당 함수는 직렬화 된다.
    코드를 보면 /xyz/.test(function(){xyz;}) 이 표현식은 문자열 xyz를 가진
    함수를 생성하고 그 함수를 문자열 xyz 를 테스트하는 정규표현식 test 메서드에 전달한다.
    test() 메서드는 문자열을 요구하므로 toString() 메서드를 호출하고 정상적으로
    직렬화 되면 결과는 true 가 된다.
    결국 superPattern = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/'
    은 어떤 함수가 _super 문자열을 포함하고 있는지 검사하는데 사용하는 변수를 설정한다.
    만일 직렬화가 허용되지 않으면 모든 문자열과 매치하는 패턴으로 대체한다.
    
### 1.3.2 하위 클래스의 인스턴스 만들기
    Object에 subClass() 메서드를 추가하는데, 이 subClass() 메서드는 하나의
    매개변수를 받는다. 이 매개변수는 하위 클래스에 추가될 프로퍼티들을 담고있는 해시이다.
    프로토타입 상속을 따라 하기 위해, 상위 클래스의 인스턴스를 생성하고 이를 
    프로토타입에 할당하는 기법을 사용한다. 개념적으로 살펴보면 다음과 같은 모양새이다
```javascript
function Person(){}
function Star(){}
Star.prototype = new Person();
console.log((new Star()) instanceof Person);
```
    이 코드조각에서 Person 객체를 만들고 생성자를 실행하는데 드는 비용은
    부담하지 않으면서도 instanceof 의 혜택을 누리게 하는것이 목표이다.
    이 문제에 대응하기 위해 initializing 변수를 두고 클래스의 인스턴스를
    만들 떄 이 변수 값을 true 로 설정한다. 이 변수는 오직 프로토타입으로
    사용할 인스턴스를 만들 때만 사용된다. 그리하여 실제로 인스턴스를 생성하여
    사용할 때가 되면 initializing 값은 false 이고 그렇다면 하위 클래스를
    정의하는 작업은 끝났다고 확신할 수 있기에, init() 메서드를 실행하거나
    건너뛸수도 있다. 여기서 중요한 점은 init() 메서드는 비용이 높은 모든 시동 코드
    에서 실행될 수 있다는 점이다. 그래서 단순히 prototype 으로만 작동하는
    인스턴스를 만들때, 불필요하고 비싼 시동코드는 피해야 한다.
    여기서 시동 코드란 서버에 연결하거나 DOM 엘리먼트를 생성하는 높은 작업들이다.

### 1.3.3 상위 메서드 보존하기
    이제 하위 클래스에 설정될 프로퍼티를 프로토타입 인스턴스에 복사하는 것이다.
    상속을 지원하는 대부분 언어는 메서드를 재정의할 떄 원본 메서드에 접근할 수단을 제공한다.
    앞서 살펴본 코드에서는 상위 클래스의 원본 메서드를 참조하는 _super 라는 임시
    메서드를 만들었고, 이 메서드는 하위 클래스의 메서드에서만 접근할 수 있다.
    하위 클래스를 확장하려면 단순히 subClass() 메서드로 전달받은 프로퍼티와
    상위 클래스의 프로퍼티를 합치기만 하면 된다.
    우선 var proto = new this() 를 통해 프로토타입으로 사용할 상위 클래스의
    인스턴스를 만든다. 이제 proto 객체에 합치면 된다.
    함수를 재정의하면서 원본 함수를 _super를 사용하여 호출한다고 하면,
    _super 프로퍼티가 상위 클래스의 함수를 참조하도록 포장 작업이 필요하다.
    하지만 그전에,하위 클래스의 어떤 함수를 포장해야 하는지 그 조건을 알아야한다.
    첫째 하위클래스의 프로퍼티가 함수인가?
    둘째 상위클래스의 프로퍼티도 함수인가?
    마지막으로 하위 클래스의 함수가 _super() 에 대한 참조를 포함하는가?
    이다. 이 세 항목이 모두 참이라면 프로퍼티 값을 단순 복사하는 대신, 무엇인가
    작업을 해주어야 한다. 만약 포장해야 한다면 즉시싱행함수의 결과를
    하위 프로퍼티에 할당함으로써 해당 함수를 포장한다.
    이 즉시실행함수는 하위 클래스의 함수를 실행하도록 포장한 새로운 함수를 반환한다.
    상위 클래스 함수는 _super 프로퍼티를 통해 참조할수 있다.
    기존의 this._super는 잠시 저장해었다가 하위 클래스의 함수를 호출하고 나면
    원래의 this,_super 값을 되돌린다. 이는 혹시라도 _super 라는 이름을 가진
    변수가 이미 존재하는 경우 도움이 된다.
    그 다음 _super 에 새 메서드를 할당하는데 이 메서드는 단지 상위 클래스의
    프로토타입에 있는 메서드를 참조할 뿐이다. 이 메서드는 상위 클래스 프로토타입에
    속해 있지만, 우리가 만든 객체의 프로퍼티로 이 메서드를 설정하면 고맙게도 자동으로
    해당 객체를 함수의 콘텍스트로 설정한다. 따라서 유효 범위를 다시 설정하기 위해
    추가적인 변경할 필요가 없다
    마지막으로 하위 클래스 메서드를 호출하고, _super 를 원래 상태로 돌린후 함수를
    빠져나온다.