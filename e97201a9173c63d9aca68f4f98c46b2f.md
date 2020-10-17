***이 글은 자바스크립트 닌자 비급을 참고해서 쓴 글입니다.***
# 1. 함수를 자유자재로 휘두르기
## 1.0 개요
    함수들을 이용해서 웹 어플리케이션을 작성할때 만나는 다양한 문제에 대한 해결법을 알아보자
    
## 1.1 익명함수
    익명 함수는 함수를 변수에 저장하거나, 어떤 객체의 메서드로 설정하기 위해 또는
    콜백으로 활용하는 것과 같이 나중에 사용하기 위한 함수를 만들 때 주로 사용한다.
    앞서 말한 상황은 나중에 함수를 참조하기 위한 용도로 함수 이름을 가질 필요가 없다.
    다음 코드는 익명 함수를 사용하는 일반적인 예제 이다.
```javascript
window.onload = function(){/**/}

var star = {
    light: function() {/**/}
}
star.light();

setTimeout(function(){/**/}, 500);
```
    첫번째 load 이벤트에 함수를 핸들러로 등록했다. 이 함수는 우리가 직접 호출하는것이 아니라
    이벤트 핸들링 메커니즘이 이 함수를 호출하므로 이름을 가질 필요가 없다,
    두번째 객체의 프로퍼티일 경우 함수의 이름이 아닌 프로퍼티 로 호출하므로 이름이 필요가 없다.
    마지막으로 타이머가 만료될때 호출하도록 setTimeout() 함수에 콜백으로 전달한다. 이 역시
    우리가 호출하지 않으므로 이름이 필요가 없다.
    
## 1.2 재귀
    재귀는 함수가 스스로를 호출하거나, 함수 내에서 다른 함수를 호출하는 과정에서
    원래 호출된 함수가 호출될때 일어난다. 간단한 형태의 재귀부터 천천히 알아보자
    
### 1.2.1 이름을 가진 함수 내에서의 재귀
    재귀의 일반적인 예로 팰린드롬 테스트가 있는데, 이는 문자열을 바로 읽으나 거꾸로 읽으나
    같은 문구인지를 확인하는 것이다.
    이를 수학적으로 정의하면,
    1. 문자가 1개 또는 0개인 문자열은 팰린드롬이다. - 기저 베이스
    2. 첫문자와 마지막 부분이 같고 나머지 부분이 팰린드롬인 문자열은 팰린드림 이다. - 더 작은 문제
    이를 구현 하면 다음과 같다
```javascript
function isPalindrome(text){
    if(text.length <= 1) return true;
    if(text.charAt(0) != text.charAt(text.length - 1)) return false;
    return isPalindrome(text.substr(1,text.length - 2));
}
```
    코드를 보면 isPalindrome 함수가 내부에서 자기자신을 호출하므로 재귀라고 할 수 있다.

### 1.2.1 메서드를 이용한 재귀
    이번엔 재귀 함수를 객체의 메서드로 선언해보자
```javascript
var star = {
    light: function(n){
        return n > 1 ? star.light(n-1) + '-chirp' : 'chirp';
    }
};
console.info(star.light(3) === 'chirp-chirp-chirp'); //true
```
    함수 내부에서 객체의 프로퍼티를 가리키는 참조를 사용해서 재귀적으로 호출한다.
    하지만 함수의 실제이름으로 호출할때와는 달리 참조는 변할수 있다.
    다음 코드와 같이 참조가 변하게 되면 재귀 함수는 동작하지 않는다
```javascript
var star = {
    light: function(n){
        return n > 1 ? star.light(n-1) + '-chirp' : 'chirp';
    }
};

var night = { lunar: star.light };
star = {};

try{
    console.info(night.light(3) === 'chirp-chirp-chirp'); //error 
} catch (e) {
  console.info(e);
};
```
    여기서 문제는 재귀 함수가 여러곳에서 참조되는데, 자신이 호출될때
    호출한 객체의 메서드인지 상관없이 star.light 를 호출하는점에 있다.
    결국 메서드를 이용한 함수 호출은 익명 함수이기에 명시적으로 객체를 참조하는 대신,
    함수의 콘텍스트인 this를 사용해야 한다.
    함수를 메서드로써 호출하면 함수의 콘텍스트는 메서드가 호출된 객체를 가리킨다는것을 기억하자.
    하지만 여전히 문제가 있다. 만일 프로퍼티의 이름이 light 가 아니거나
    함수 light 가 객체의 프로퍼티가 아닐경우 문제가 된다.
    결국 함수에 이름이 필요하게 된다. 이를 인라인 함수(이름이 있는 익명함수) 라고하는데
    다음 코드와 같이 재귀 함수를 프로퍼티로 설정할수 있다.
```javascript
var star = {
    light: function night(n){
        return n > 1 ? night(n-1) + '-chirp' : 'chirp'; 
    }
};
```
    이 방법 말도고 arguments 매개변수의 callee 프로퍼티라는 함수를 이용하는 방법도 있다.
    (callee 프로퍼티는 ES5 부터 엄격 모드에서 사용이 금지됨)
    다음 코드를 보자
```javascript
var star = {
    light: function(n) {
        return n > 1 ? arguments.callee(n-1) + '-chirp' ? 'chirp';
    }
};
```
    arguments 매개변수는 callee 라는 프로퍼티를 가지고 있는데,
    이는 현재 실행 중인 함수를 가리킨다.
    
### 1.3 함수 객체 가지고 놀기
    자바스크립트 함수는 1종 객체로 프로퍼티를 추가할수 있다.
    이 점을 이용해서 서로 다르지만 연관성을 지닌 함수들을 저장하고 싶을때
    함수의 프로퍼티를 활용하면 컬렉션에 넣어서 일일이 비교하는 고지식한 방법이 아닌
    세련된 방법으로 구현할수 있다.
```javascript
var store = {
    nextId: 1,
    cache: {},
    add: function(fn){
        if (!fn.id){
            fn.id = store.nextId++;
            return !!(store.cache[fn.id] = fn); // !!는 Boolean 객체로 만드는 방법
        }
    }
};
```
    뿐만 아니라 함수의 프로퍼티를 활용해서 함수가 수행한 연산의 결과를 저장할 수도 있다.
    즉, 같은 연산을 수행하는 시간을 절약할 수 있다.
    이를 메모이제이션이라 하는데, 예시를 통해 알아보자
    먼저 복잡하게 소수를 만드는 코드를 작성해보자
```javascript
function isPrime(value){
    if(!isPrime.answers) isPrime.answers = {};
    if(isPrime.answers[value]) return isPrime.answers[value];
    var prime = value != 1;
    for (var i = 2; i < value; i++){
        if (value % i == 0) {
            prime = false;
            break;
        }
    }
    return isPrime.answers[value] = prime;
};
```
    이 코드를 보면 사용자가 함수를 사용했을때 넘긴 매개변수가 이미 캐시에 존재한다면
    연산없이 반환하지만 없다면 비용이 드는 연산을 실행할 것이다.
    이것이 메모이제이션으로 사용자는 이전에 연산된 값을 요청할때 성능 향상을 얻을수 있고,
    사용자는 메모이제이션에 대한 별로 작업이 필요없이 동작한다는 것이다.
    대신 메모리 사용량이 늘어난다는 점과, 함수 자체의 성능 테스트를 하기 힘들다는 단점도 있다.
    유사한 다른 예를 보자
```javascript
function getElements(name){
    if(!getElements.cache) getElements.cache = {};
    return getElements.cache[name] = getElements.cache[name] 
    || document.getElementsByTagName(name);
};
```
    이는 태그 명으로 DOM 엘리먼트 집합을 검색하는것을 메모이제이션으로 활용한 방식이다.
    이처럼 함수의 프로퍼티를 이용하면 상태와 캐시 정보를 외부에 노출하지 않는 단일 장소에 보관할수 있다.
    
    때때로 컬렉션을 멤버로 갖는 객체가 필요할 때가 있다. 컬렉션에 대한 메타 데이터를 같이
    저장하는 경우가 이에 해당한다. 한가지 방법은 새로운 버전의 객체가 필요할 때마다
    새로운 배열을 만들고 메타 데이터와 관련된 프로퍼티오아 메서드를 추가하는 것이다.
    하지만 이 방법은 매우 느리다.
    이럴때는 평범한 객체에 원하는 기능을 추가하는 방법을 사용하면 된다.
```javascript
var elems = {
    length: 0,
    add: function(elem){
        Array.prototype.push.call(this, elem);
    },
    gather: function(id){
        this.add(document.getElementById(id));
    }
};
```
    위 코드에서는 객체에 배열의 일부 동작을 흉내낸 코드이다.
    먼저 엘리먼트의 수를 기록할 용도로 length 프로퍼티를 정의하고,
    배열처럼 동작하는 객체에 엘리먼트를 추가할수 있도록 메서드를 추가한다.
    여기서 push() 메서드는 length 프로퍼티가 배열의 속성인것으로 생각에 
    length 프로퍼티에 저장된 값을 증가시키고, 객체에는 숫자로 된 프로퍼티를
    추가한 다음 전달된 엘리먼트를 저장한다.
    이 예를 통해 함수의 콘텍스트를 이용해 많은 일을 할 수 있을음 보여준다
    
## 1.4 가변인자 목록
    자바스크립트는 전반적으로 유연한 언어인데 그중 강력한 기능중 하나는 함수가
    임의 개수의 인자를 받을 수 있다는 것이다. 이를 통해 함수 오버로딩의 유사한 장점을 얻을수 있다.
    먼저 다양한 개수의 인자를 전달하기 위해 apply() 메서드를 이용해보자
    먼저 예를 들면 Math.max() 는 가변인자 목록을 요구한다.
    만일 배열을 인자로 넣고싶을때 apply() 를 이용하면된다. apply() 메서드는 모든 함수가 지니고 있다.
```javascript
function largest(array){
    return Math.max.apply(Math, array);
}
```
    apply() 메서드를 이용하여 Math.max()에 가변인자 목록으로 전달하는 방식이다.
    
    다음으로 함수 오버로딩에 대해 알아보자. 모든 함수는 암묵적으로 arguments 매개변수가 전달된다.
    이를 이용해서 자바스크립트는 전달된 인자의 수와 유형에 따라 동작방식이 변경되는
    단일 함수를 이용해서 함수를 오버로드 한다. 먼저 인자를 다루어 보자
```javascript
function merge(root){
    for (var i = 1; i < arguments.length; i++) {
        for (var key in arguments[i]) {
            root[key] = arguments[i][key];
        }
    }
    return root;
}
```
    위 코드는 여러 객체의 프로퍼티를 하나의 루트에 통합해 넣는것이다.
    이는 전달된 인자가 미리 알 수 없는 상황이더라도 유연하게 만들수 있는것을 보여준다.
    
    다음 예제로 함수의 첫 번째 인자를 나머지 인자 중에서 가장 큰 값과 곱하는 함수를 만들어 보자
```javascript
function starlight(night){
    return night * Math.max.apply(Math, arguments.slice(1));
}
```
    하지만 이 함수는 에러가 나온다. 이유는 arguments 는 배열이 아니기 때문에
    slice() 메서드를 사용할수 없다.
    결국 slice() 메서드를 직접 구현해야하지만 Array 객체에 이미 있기에
    우리는 그럴 필요가 없다
```javascript
function starlight(night){
    return night * Math.max.apply(Math,
     Array.prototype.slice.call(night, 1));
}
```
    이제 함수 오버로딩에 대해 접근해보자
    함수 오버로딩은 전달된 인자에 따라 함수의 동작이 달라지는 기법을 말한다.
    간단하게 생각하면 조건문을 생각할수 있으나 상황이 복잡해지면 다루기 힘들어진다.
    이는 같은 이름을 가진 것 처럼 보이는 복수의 함수들을 만드는 기법으로 해결할수 있다.
    그 전에 먼저 length 프로퍼티를 살펴보자
    length 프로퍼티는 모든 함수가 가지고 있는데 이는 이름을 가진 매개변수의 수가 저장되어있다.
    예를 들면
```javascript
function star(sun){}
function light(lunar, sun){}
console.log(star.length) // 1
console.log(light.length) // 2
```
    결과적으로 함수는 length 프로퍼티를 통해 이름을 지는 매개변수의 수를
    arguments.length 를 통해 호출 시에 전달된 인자의 수를 알 수 있다.
    
    함수의 인자를 기반으로 오버로드를 결정하는 방법은 여러가지가 있는데,
    전달된 인자의 타입에 근거해서 다른 연산을 실행하거나, 특정 매개변수의 유무에 따라 전환,
    전달된 인자의 수를 이용하는 방법이 있다.
    인자의 수를 이용한 방법을 대표로 살펴보자
    간단하게 switch 문을 이용해서 인자의 갯수가 0부터 n 까지 사용하는 방법이 있을것이다.
    그러나 이 방법은 그다지 깔끔해 보이지않는다.
    다른 방법으로 다음과 같이 추가할수 있는 방법이면 어떨까?
```javascript
var star = {}
addMethod(star, 'whatever', function() {/* */});
addMethod(star, 'whatever', function(a) {/* */});
addMethod(star, 'whatever', function(a, b) {/* */});

function addMethod(object, name, fn){
    var old = object[name];
    object[name] = function(){
        if (fn.length == arguments.length){
            return fn.apply(this, arguments);
        }
        else if (typeof old === 'function'){
            return old.apply(this, arguments);
        }
    }
};
```
    여기서 객체를 만든후 이름을 이용해서 메서드를 추가하는데, 같은 이름일 경우
    오버로딩이 된다. 만일 같은 이름으로 메서드를 호출하면, 먼저 이전에 저장된 함수를
    저장한다. 그 후에 현재 메서드랑 매개변수의 수를 비교해서 현재 함수를 호출할지를 판단한다.
    만일 아니라면 이전에 저장된 함수를 호출한다.
    즉, 각 레이어는 인자의 수가 일치하는지 확인하고 일치하지 않는 경우 이전에 만들어진
    레이어로 호출을 전달한다. 하지만 이 방법은 함수를 호출하는데 오버헤드가 존재한다는 점을 생각해야 한다.
 **TODO**
 클로저 정리하고 내용 추가하기
    
    
    
    