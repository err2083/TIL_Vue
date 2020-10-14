# vue-blog

## 0. CLI

처음에 Vue3 으로 프로젝트를 만들었더니 크롬 확장 도구가 듣지 않을뿐더라 router-view 를 인식을 못했다.
또한 미세하게 createApp, createRouter, createWebHistroy 등등 을 쓰는듯 보였다.
문제는 역시나 안되었다. 결국 Vue2 로 다시 프로젝트를 만들었다,

## 1. 라우터

먼저 라우터를 적용해보겠다. 일단 의존성을 추가해주어야 한다.
npm i vue-router 명령어를 실행하면 package.json 에 의존성이 추가된것을 확인할수 있다. (--save 옵션을 주면 package.json 에 추가해주는거라고 하는데, 없어도 추가가 된다.)
의존성이 추가가 됬다면 기본적인 세팅을 해주어야한다. @/router/index.js 처럼 구성하면 된다.

```javascript
1) Vue.use(VueRouter);
2) mode: 'history';
3) router: [{path: '/', component: component}];
```

1) 뷰에게 뷰 라우털르 사용하겠다는 뜻이다
2) mode 를 history 모드로 사용하겠다는 의미인데 이를 사용하지 않으면 경로에 @가 들어간다.
3) 본격적으로 경로와 컴포넌트가 매칭하는 부분이다. path 와 compoent 가 매칭이 되어 그리게 된다. 만일 다른 경로로 보내고 싶다면 redirect 롤 사용해주면 된다.

## 2. SCSS

역시 의존성을 먼저 추가해주어야한다.
npm i node-sass sass-loader 명령어를 실행해서 로더를 받아주자
전역으로 scss 를 적용하고 싶다면 App.vue 파일처럼 적용해주면 된다.

## 3. Footer component

footer 컴포넌트에 style=background-image 를 적용하느 부분이 있다. 아직도 방법을 찾고있다.
