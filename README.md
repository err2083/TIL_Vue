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

1) 뷰에게 뷰 라우터를 사용하겠다는 뜻이다
2) mode 를 history 모드로 사용하겠다는 의미인데 이를 사용하지 않으면 경로에 @가 들어간다.
3) 본격적으로 경로와 컴포넌트가 매칭하는 부분이다. path 와 compoent 가 매칭이 되어 그리게 된다. 만일 다른 경로로 보내고 싶다면 redirect 롤 사용해주면 된다.

## 2. SCSS

역시 의존성을 먼저 추가해주어야한다.
npm i node-sass sass-loader 명령어를 실행해서 로더를 받아주자
전역으로 scss 를 적용하고 싶다면 App.vue 파일처럼 적용해주면 된다.

## 3. Footer, Navi, SideBar component

footer 컴포넌트에 style=background-image 를 적용하는 부분이 있다. 이는 정적으로 로딩하는 부분이므로 css 를 이용해서 그려주도록 하자

navi 컴포넌트는 router-link 를 구현해주는 부분이다

sidevar 컴포넌트는 footer 와 navi 를 그려주는 컴포넌트이다.

## 4. About component

이제 본문을 그려보자. 일단 이미지를 window 크기에 맞추어주어야한다. v-bind:style={} 를 활용하여 높이를 동적으로 변화를 주어보자
v-bind:style 은 동적으로 변화를 주어도 dom 이 재렌더링이 안되는것같았는데, 스타일에 단위를 명시적으로 적어주지 않으면 높이가 변하지 않았다.
vue 에서 스타일을 건들때 꼭 단위를 적어주자.

```javascript
this.styleObj.height = window.innerHeight + 'px';
```

그리고 this.$nextTick 이라는 메소드가 있는데 UI 를 변경할때 완전히 그리고 난 후에 변경할수 있게
콜백을 달아주는 메소드가 있으니 필요할때 사용해보도록 하자.

## 5. Post component

강슬기 사진을 랜덤으로 표시를 해보자. v-bind:style={backgroundImage: url(${path})} 의 템플릿으로 넣어주어야한다.
이때 path 는 require 로 받은 url 이여야 한다.
코드를 보면

```javascript
<template>
    <div v-bind:style="{ backgroundImage: 'url(' + imgUrl + ')' }"></div>
</template>
this.imgUrl = require(`@/assets/강슬기/강슬기${random}.${extend}`);
```

[a link](https://stackoverflow.com/questions/35242272/vue-js-data-bind-style-backgroundimage-not-working/35244182)

처럼 경로를 구성해주면 된다.

## PostListView

여기서 가장 먼저 해야할것은 디렉토리를 읽은 다음 해당 정보를 리스트로 뿌려주어야 한다.
require.context 를 이용해서 md 파일 리스트를 가져오고 이를 Post component 을 아용해서 그려보자

## github-css 적용

[a link](https://github.com/sindresorhus/github-markdown-css)
