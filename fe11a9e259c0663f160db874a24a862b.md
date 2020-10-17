***이 글은 You Don't Know JS을 참고해서 쓴 글입니다.***
# 1. 작동 위임
## 1.1 위임 지향 디자인으로 가는 길
    [[Prototype]]의 사용 방법을 가장 쉽게 이해하려면 먼저 [[Prototype]]이 클래스와는 근본부터 다른
    디자인 패턴이라는 사실을 인지해야한다.

### 1.1.1 클래스 이론
    소프트웨어 모델링이 필요한 3개의 유사한 Task가 있다고 하자. 클래스 기반의 디자인 설계 과정은
    가장 일반적인 부모 클래스와 유사한 Task의 공동 작동을 정의하고 Task를 상속받은 2개의 자식 클래스
    를 정의한 후 이들에 특화된 작동을 두 클래스에 각각 추가한다.
    클래스 디자인 패턴에서는 상속의 진가를 발휘하기 위해, 메서드를 오버라이드할 것을 권장하고 작동
    추가 뿐만 아니라 오버라이드 이전 원본 메서드를 super 키워드로 호출할 수 있게 지원한다.
    공통 요소는 추상화하여 부모 클래스의 일반 메서드로 구현하고 자식 클래스는 이를 더 세분화하여 쓴다.
    이제 하나 또는 그 이상 자식 클래스의 사본을 인스턴스화 하고 이 인스턴스에는 원하는 작동이 모두
    복사되어 옮겨진 상태로, 오직 인스턴스와 상호 작용한다.
    
### 1.1.2 위임 이론
    같은 문제를 작동 위임을 이용하여 생각해보자. 먼저 Task 객체를 정의하는데, 이 객체에는 다양한
    Task 에서 사용할 유틸리티 메서드가 포함된 구체적인 작동이 기술된다. Task 객체를 정의하여 고유한
    데이터와 작동을 정의하고 Task 유틸리티 객체에 연결해 필요할 때 특정 객체가 위임하도록 작성하자.
    기본적으로 XYZ 태스크 하나를 실행하려면 형제, 동료 객체로 부터 작동을 가져온다고 생각하자.
    이는 각자 별개의 객체로 분리된 상태에서 필요할 때마다 XYZ 객체가 tASK 객체에 작동을 위임하는 구조다.
```javascript
var Task = {
    setID: function(ID) {
        this.id = ID;
    },
    outputID: function() {
        console.log(this.id);
    }
};
var XYZ = Object.create(Task);
XYZ.prepareTask = function(ID, Label) {
    this.setID(ID);
    this.label = Label;
};
XYZ.outputTaskDetails = function() {
    this.outputID();
    console.log(this.label);
};
```
    예쩨에서 Task와 XYZ는 클래스나 함수도 아닌 그냥 객체이다.
    XYZ는 Object.create() 메서드로 Task 객체에 [[Prototype]] 위임을 했다.
    클래스 지향과 대비하여 이런 스타일 코드를 OLOO(Objects Linked to Other Objects)라 부른다.
    XYZ 객체가 Task 객체에 작동을 위임하는 부분만 신경 쓰면 된다.
    OLOO 스타일 코드의 특징으 다음과 같다.
    1. 예제 코드에서 id 와 label 두 데이터 멤버는 XYZ의 직속 프로퍼티다. 일반적으로
    [[Prototype]] 위임 시 상태값은 위임하는 쪽에 두고 위임받는 쪽에는 두지 않는다.
    2. 클래스 디자인 패턴에서는 부모/자식 양쪽에 메서드 이름을 똑같게 오버라이드 했다.
    작동 위임 패턴은 정반대다. 서로 다른 수준의 [[Prototype]] 연쇄에서 같은 명칭이 뒤섞이는 일은
    가능한 피해야 한다. 작동 위임 패턴에서는 일반적인 메서드 명칭보다 각 객체의 작동 방식을 잘 설명
    하는 명칭이 필요하다.
    3. this.setID(ID) 는 일단 XYZ 객체 내부에서 setID() 를 찾지만 XYZ에는 이 메서드가 존재하지
    않으므로 [[Prototype]] 위임 링크가 체결된 Task로 이동하여 setID()를 발견한다. 그리고 암시적
    호출부에 따른 this 바인딩 규직에 따라 Task에서 발견한 메서드지만 setID() 실행 시 this는 XYZ로
    바인딩 된다.
    
    작동 위임이란 찾으려는 프로퍼티/메서드 래퍼런스가 객체에 없으면 다른 객체로 수색 작업을 위임하는
    것을 의미한다. 이는 상속 이라는 수직적인 클래스 다이어그램이 아닌 객체들이 수평적으로 배열된
    상태에서 위임 링크가 체결된 모습을 떠올리자.
    
    복수의 객체가 양방향으로 상호 위임을 하면 발생하는 사이클은 허용되지 않는다.
    즉, [B -> A] 로 링크된 상태에서 [A > B] 로 링크하려고 시도하면 에러가 난다.
    
### 1.1.3 멘탈 모델 비교
    클래스와 위임 두 디자인 패턴을 멘탈 모델에 기반하여 어떤 의미를 가지는즈 살펴보자
    다음은 고전적인 프로토타입 스타일이다
```javascript
function Foo(who) {
    this.me = who;
};
Foo.prototype.identify = function() {
    return 'i am ' + this.me;
};

function Bar(who) {
    Foo.call(this, who);
};
Bar.prototype = Object.create(Foo.prototype);
Bar.prototype.speak = function() {
    alert('Hello, '+ this.identify() + '.');
};

var b1 = new Bar('b1');
var b2 = new Bar('b2');
b1.speak(); // Hello, i am b1.
b2.speak(); // Hello, i am b2.
```
    자식 클래스 Bar는 부모 클래스 Foo를 상속한 뒤 b1과 b2로 인스턴스화 한다. 그 결과 b1은
    Bar.prototype으로 위임되며 이는 다시 Foo.prototype으로 위임된다.
    
    다음은 OLOO 스타일이다
```javascript
var Foo = {
    init: function(who) {
        this.me = who;
    },
    identify: function() {
        return 'I am ' + this.me;
    }
};

var Bar = Object.create(Foo);
Bar.speak = function() {
    alert('Hello, ' + this.identify() + '.');
};

var b1 = Object.create(Bar);
b1.init('b1');
var b2 = Object.create(Bar);
b2.init('b2');

b1.speak(); // Hello, I am b1.
b2.speak(); // Hello, I am b2.
```
    앞에서 [b1 -> Bar.prototype -> Foo.prototype] 방향으로 위임한 것처럼 여기서도
    [b1 -> Bar -> Foo] 로 [[Prototype]] 위임을 활용하며, 세 객체는 서로 단단히 연결되어 있다.
    여기서 중요한 점은 생성자, 프로토타입, new 호출등 클래스처럼 보이게하려고 만든 장치들 없이
    객체를 서로 연결해주기만 했다는 점이다.
    
    그럼 두 코드에 관한 멘탈 모델을 살펴보자
    todo 이미지 넣기
![name](./path)

## 1.2 클래스 vs 객체
    이 절에서는 좀 더 구체적인 코드를 보자. 먼저 프런트엔드 웹 개발에서 가장 빈번한 위젯을 보자

### 1.2.1 위젯 클래스
    객체 지향 디자인 패턴에 오랫동안 길든 사람들은 위젯 말만 들어도 모든 위젯 작동의 공통 기반이
    될 부모 클래스와 유형마다 다른 위젯을 나타내는 자식 클래스를 머리속에 떠올릴 것이다.
```javascript
// 부모 클래스
function Widget(width, height) {
    this.width = width || 50;
    this.height = height || 50;
    this.$elem = null;
}

Widget.prototype.render = function($where) {
    if (this.$elem) {
        this.$elem.css({
            width: this.width + 'px',
            height: this. this.height + 'px'
        }).appendTo($where);
    }  
};

// 자식 클래스
function Button(width, height, label) {
    // 'super' 생성자 호출
    Widget.call(this, width, height);
    this.label = label || "Default";
    this.$elem = $('<button>').text(this.label);
}

// 'Button'은 'Widget'으로부터 상속받는다
Button.prototype = Object.create(Widget.prototype);

// '상속받은' render() fmf 오버라이드 한다.
Button.prototype.render = function($where) {
    // 'super' 호출
    Widget.prototype.render.call(this, $where);
    this.$elem.click(this.onClick.bind(this));
};

Button.prototype.onClick = function(evt) {
    console.log(this.label + '버튼이 클릭됨!');
};
$(document).ready(function() {
   var $body = $(document.body);
   var btn1 = new Button(125, 30, 'Hello');
   var btn2 = new Button(150, 40, 'World');
   
   btn1.render($body);
   btn2.render($body);
});
```
    객체 지향 디자인 패턴에 따르면 부모 클래스에는 기본 render() 만 선언해두고 자식 클래스가
    이를 오버라이드 하도록 유도한다. 기본 기능을 버튼에만 해당하는 작동을 덧붙여 기본 기능을 증강한다.
    앞선 코드를 ES6 class 간편 구문으로 구현해보자
```javascript
class Widget {
    constructor(width, height) {
        this.width = width || 50;
        this.height = height || 50;
        this.$elem = null;
    }
    render($where) {
        if (this.$elem) {
            this.$elem.css({
                width: this.width + 'px',
                height: this.height + 'px'
            }).append($where);
        }  
    }
}

class Button extends Widget {
    constructor(width, height, label) {
        super(width, height);
        this.label = label || "Default";
        this.$elem = $('<button>').text(this.label);
    }
    render($where) {
        super.render($where);
        this.$elem.click(this.onClick.bind(this));
    }
    onClick(evt) {
        console.log(this.label + '버튼이 클릭됨!');
    }
}
$(document).ready(function() {
   var $body = $(document.body);
   var btn1 = new Button(125, 30, 'Hello');
   var btn2 = new Button(150, 40, 'World');
   
   btn1.render($body);
   btn2.render($body);
});
```
    이전 코드랑 비교하면 상당히 매끄러워졌는데 특히 super() 가 있다는 점이 훌륭해 보인다.
    다음은 OLOO 스타일의 위임 코드이다
```javascript
var Widget = {
    init: function(width, height) {
        this.width = width || 50;
        this.height = height || 50;
        this.$elem = null;
    },
    insert: function($where) {
        if (this.$elem) {
                this.$elem.css({
                width: this.width + 'px',
                height: this.height + 'px'
            }).append($where);
        }
    }
};

var Button = Object.create(Widget);
Button.setup = function(width, height, label) {
    // 위임 호출
    this.init(width, height);
    this.label = label || 'Default';
    this.$elem = $('<button>').text(this.label);
};
Button.build = function($where) {
    // 위임 호출
    this.insert($where);
    this.$elem.click(this.onClick.bind(this));
};
Button.onClick = function(evt) {
    console.log(this.label + ' 버튼이 클릭됨!');
};

$(document).ready(function() {
   var $body = $(document.body);
   var btn1 = Object.create(Button);
   btn1.setup(120, 35, 'Hello');
   var btn2 = Object.create(Button);
   btn2.setup(150, 40, 'World');
   
   btn1.build($body);
   btn2.build($body);
});
```
    OLOO 관점에서는 Widget이 부모도 Button 이 자식도 아니다. Widget은 보통 객체로
    갖가지 유형의 위젯이 위임히여 사용할 수 있는 유틸리티 창고 역할을 맡는다.
    디자인 패턴관점에서 클래스 방식이 고집하는 같은 이름의 render() 메서드를 공유할 필요가
    없다. 대신 각자 수행하는 임무를 더욱 구체적으로 드러낼 다른 이름을 부여한다.
    
## 1.3 더 간단한 디자인
    작동 위임 패턴은 실제로 더 간단한 코드 아키텍처를 가능케 한다.
    OLOO로 어떻게 디자인을 전반적으로 단순화시킬 수 있는지 코드를 보자
    로그인 페이지의 입력 폼을 처리하는 객체, 서버와 직접 인증을 수행하는 객체가 있다고 하자.
    전형적인 클래스 디자인 패턴에 의하면 Controller 클래스에 기본적인 기능을 담아두고 이를
    상속받은 LoginController 와 AuthController 두 자식 클래스가 구체적인 작동 로직을 구현
    하는 방식이 될것이다.
```javascript
function Controller() {
    this.error = [];
}
Controller.prototype.showDialog = function(title, msg) {
    
};
Controller.prototype.success = function(msg) {
    this.showDialog("Success", msg);
};
Controller.prototype.failure = function(err) {
    this.errors.push( err );
    this.showDialog("Error",err);
};
// 자식 클래스
function LoginController() {
    Controller.call(this);
}
LoginController.prototype = Object.create(Controller.prototype);
LoginController.prototype.getUser = function() {
    return document.getElementById('login_username').value;
};
LoginController.prototype.getPassword = function() {
    return document.getElementById('login_password').value;  
};
LoginController.prototype.validateEntry = function(user, pw) {
      user = user || this.getUser();
      pw = pw || this.getPassword();
      if (!(user && pw)) {
          return this.failure('ID와 비밀번호를 입력하여 주십시오!');
      }
      else if (pw.length < 5) {
          return this.failure('비밀번호는 5자 이상이어야 합니다!');
      }
      return true;
};
LoginController.prototype.failure = function(err) {
    // 'super' 를 호출한다.
    Controller.prototype.failure.call(this, '로그인 실패: ' + err);
};
function AuthController(login) {
    Controller.call(this);
    this.login = login;
}
AuthController.prototype = Object.create(Controller.prototype);
AuthController.prototype.server = function(url, data) {
    return $.ajax({
        url: url,
        data: data
    });
};
AuthController.prototype.checkAuth = function() {
    var user = this.login.getUser();
    var pw = this.login.getPassword();
    
    if (this.login.validateEntry(user, pw)) {
        this.server('/check-auth', {
            user: user,
            pw: pw
        })
        .then(this.success.bind(this))
        .fail(this.failure.bind(this));
    }
};
AuthController.prototype.success = function() {
    // 'super'를 호출한다
    Controller.prototype.success.call(this, '인증 성공!');  
};
AuthController.prototype.failure = function() {
    Controller.prototype.failure.call(this, '인증 실패: ' + err);
};
var auth = new AuthController(new LoginController());
auth.checkAuth();
```
    success(), failure(), showDialog()는 모든 컨트롤러가 공유하는 기본 작동이 구현된
    메서드 들이다. 자식 클래스는 이들을 오버라이드 하여 기본 작동을 증강한다.
    다음은 OLOO 스타일의 작동위임 스타일 코드이다
```javascript
var LoginController = {
    errors: [],
    getUser: function() {
        return document.getElementById('login_username').value;
    },
    getPassword: function() {
        return document.getElementById('login_password').value;
    },
    validateEntry: function(user, pw) {
        user = user || this.getUser();
        pw = pw || this.getPassword();
        if (!(user && pw)) {
            return this.failure('ID와 비밀번호를 입력하여 주십시오!');
        }
        else if (pw.length < 5) {
            return this.failure('비밀번호는 5자 이상이어야 합니다!');
        }
        return true;
    },
    showDialog: function(title, msg) {
        
    },
    failure: function(err) {
        this.errors.push(err);
        this.showDialog('에러', '로그인 실패: ' + err);
    }
};
var AuthController = Object.create(LoginController);
AuthController.errors = [];
AuthController.checkAuth = function() {
    var user = this.getUser();
    var pw = this.getPassword();
        
    if (this.validateEntry(user, pw)) {
        this.server('/check-auth', {
            user: user,
            pw: pw
        })
        .then(this.success.bind(this))
        .fail(this.failure.bind(this));
    }
};
AuthController.server = function(url, data) {
    return $.ajax({
        url: url,
        data: data
    });
};
AuthController.accepted = function() {
    this.showDialog('성공', '인증 성공!');
};
AuthController.rejected = function(err) {
    this.showDialog('인증 실패: ' + err);
};
AuthController.checkAuth();
```
    OLOO 위임 연쇄에 하나 또는 그 이상의 객체를 추가로 생성하야 할경우 다음과 같이
    간단히 코딩할수 있다. 이때 클래스 인스턴스 따위는 필요없다
```javascript
var controller1 = Object.create(AuthController);
var controller2 = Object.create(AuthController);
```
    작동 위임 패턴에서 AuthConttroller 와 LoginConterller는 수평적으로 서로를 엿보는
    객체일 뿐이며 억지로 부모 자식 관계를 맺을 필요가 없다.
    이 둘 사이에 작동을 공유하기 위해 징검다리 역할을 대신할 기본 Controller가 더는 필요없어졌다.
    또 클래스 자체가 없으므로 클래스 인스턴스 과정도 생략된다.
    마지막으로 메서드를 똑같은 이름으로 포함하지 않아도 되니 다형성 문제도 해결된다.
    
## 1.4 더 멋진 구문
    ES6 class가 시선을 잡아끄는 매력 중 하나는 클래스 메서드를 짧은 구문으로 쓸수 있다는 점이다
```javascript
class Foo {
    methodName() {};
}
```
    ES6부터는 객체 리터럴에 단축 메서드 선언이 가능하며 다음과 같이 OLOO 스타일 객체를 선언할 수 있다.
```javascript
var LoginController = {
    errors: [],
    getUser() {
        
    },
    getPassword() {
        
    }
}
```
    class 와 차이점이라면 콤마로 원소를 구분해야한다는 점 뿐이다.
    하지만 이러한 단축 메서드 선언은 익명 함수 표현식이므로 재귀, 이벤트 바인딩등 자기참조가 어렵다는
    단점이 있으므로 가능하면 사용하지 않는것을 권장한다.

## 1.5 인트로스펙션
    클래스 지향 프로그래밍 경험이 많으 개발자라면 인스턴스를 조사해 객체 유형을 거꾸로 유츄하는
    타입 인트로스펙션에 익숙할 것이다.
    다음은 instanceof 연산자로 객체 a1의 기능을 추론하는 코드다.
```javascript
function Foo() {
    
}
Foo.prototype.something = function() {
    console.log('something');  
};
var a1 = new Foo();
if (a1 instanceof Foo) {
    a1.something(); // something
}
```
    Foo.prototype는 a1의 [[Prototype]] 연쇄에 존재하므로 instanceof 연산자는 마치 a1이 Foo 클래스
    의 인스턴스인 것 같은 결과를 낸다. 그래서 a1 이 Foo 클래스의 기능을 가진 객체라고 생각할수 있다.
    구문만 보면 instanceof가 a1과 Foo의 관계를 조사하는 듯 보이지만 실제로는 a1과 Foo.prototype 사이의
    관계를 알려주는 일을 한다.
    다음은 instanceof 연산자와 .prototype을 이용하여 타입 인트로스펙션을 통해 체크한것들이다.
```javascript
function Foo() {}
function Bar() {}
Bar.prototype = Object.create(Foo.prototype);
var b1 = new Bar('b1');

Bar.prototype instanceof Foo; // true
Object.getPrototypeOf(Bar.prototype) === Foo.prototype; // true
Foo.prototype.isPrototypeOf(Bar.prototype); // true
b1 instanceof Foo; // true
b1 instanceof Bar; // true
Object.getPrototypeOf(b1) === Bar.prototype; // true
Foo.prototype.isPrototypeOf(b1); // true
Bar.prototype.isPrototypeOf(b1); // true
```
    가령 직관적으로 인스턴스가 상속을 포함한다고 생각하여 Bar instanceof Foo 같은 체크를 할려고
    마음먹을 수 있다. 그러나 자바스크립트에서는 이런 비교는 없다. Bar.prototype instanceof Foo 라면
    모를까
    덕 타이핑 이라 하여 많은 개발자가 instanceof 보다 선호하는 또 다른 인트로스펙션이 있다.
    이는 오리처럼 보이는 동물이 오리 소리를 낸다면 오리가 분명하다라는 속담에서 나온 용어인데
    예를 들어 something() 함수를 가진 객체와 a1의 관계를 조사하는 대신 a1.something를 테스트해보고
    통과하면 a1은 .something()을 호출할 자격이 있다고 가정하는것이다.
```javascript
if (a.something) {
    a1.something();
}
```
    가장 대표적인 덕 타이핑 으로 ES6 프로미스가 있다. 어떤 임의의 객체가 프로미스인지 판단해야할 경우
    then() 함수를 가졌는지 조사하는식으로 테스트를 한다.
    다음은 OLOO 스타일의 인트로스펙션 이다
```javascript
function Foo() {}
var Bar = Object.create(Foo);
var b1 = Object.create(Bar);

Foo.isPrototypeOf(Bar); // true
Object.getPrototypeOf(Bar) === Foo; // true
Foo.isPrototypeOf(b1); // true
Bar.isPrototypeOf(b1); // true
Object.getPrototypeOf(b1) === Bar; // true
```   
    