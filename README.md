<p align="center">
    <a href="" target="_blank">
      <img src="https://s1.ax1x.com/2023/07/02/pCDR0W4.png" width="280" />
    </a>
</p>

<h1 align="center">MallChat-抹茶</h1>
<p align="center"><strong>一个既能购物又能即时聊天的电商系统。致力于打造互联网企业级项目的最佳实践。<br>电商该有的购物车、订单、支付、推荐、搜索、拉新、促活、推送、物流、客服、它都必须有。<em>持续更新 ing～</em></strong></p>

<div align="center">
 <a href="#公众号"><img src="https://img.shields.io/badge/公众号-程序员阿斌-blue.svg?style=plasticr"></a>
    <a href="#公众号"><img src="https://img.shields.io/badge/交流群-加入开发-green.svg?style=plasticr"></a>
    <a href="https://github.com/zongzibinbin/MallChat"><img src="https://img.shields.io/badge/github-项目地址-yellow.svg?style=plasticr"></a>
    <a href="https://gitee.com/zhongzhibinbin/MallChat"><img src="https://img.shields.io/badge/码云-项目地址-orange.svg?style=plasticr"></a>
    <a href="https://github.com/Evansy/MallChatWeb"><img src="https://img.shields.io/badge/前端-项目地址-blueviolet.svg?style=plasticr"></a>
    <a href="https://github.com/zongzibinbin/MallChat/commits" target="_blank"><br>
    <a href="https://github.com/Evansy/MallChatWeb/actions/workflows/deploy.yml" target="_blank">
        <img alt="Commit" src="https://github.com/Evansy/MallChatWeb/actions/workflows/deploy.yml/badge.svg?branch=main">
    </a>
    <a href="https://github.com/Evansy/MallChatWeb/commits" target="_blank">
        <img alt="Commit" src="https://img.shields.io/github/commit-activity/m/Evansy/MallChatWeb"></a>
    <a href="https://github.com/Evansy/MallChatWeb/issues" target="_blank">
        <img alt="Issues" src="https://img.shields.io/github/issues/Evansy/MallChatWeb">
    </a> 
    <a href="https://github.com/Evansy/MallChatWeb/blob/master/LICENSE" target="_blank">
        <img alt="License: Apache-2.0" src="https://img.shields.io/badge/License-Apache--2.0-blue.svg">
    </a> 
    <a href="https://github.com/Evansy/MallChatWeb" target="_blank">
        <img alt="License" src="https://img.shields.io/github/stars/Evansy/MallChatWeb.svg?style=social">
    </a> 
    
</div>

## 项目导航

1. **快速体验地址**：[抹茶聊天首页](https://mallchat.cn)
2. **后端项目仓库**：[MallChat](https://github.com/zongzibinbin/MallChat)
3. **项目视频记录**：[Bilibili 地址](https://space.bilibili.com/146719540) 全程分享项目进度，功能选型的思考，同时征集迭代建议。
4. **项目学习文档**：10w+字，保姆级教学路线，环境搭建、核心功能、基建轮子、接口压测、问题记录、一个不落。可点击[抹茶项目文档](https://www.yuque.com/snab/planet/cef1mcko4fve0ur3)查看（内含 500 人交流大群）
5. **项目交流群**：对抹茶感兴趣的，可以加入[交流群](#公众号)。你的每一个举动，都会决定项目未来的方向。无论是提意见做产品经理，还是找 bug 做个测试人员，又或者加入开发小模块成为 contributer，都欢迎你的加入。
6. **码云仓库**：[https://gitee.com/Evansy/MallChatWeb](https://gitee.com/Evansy/MallChatWeb) （国内访问速度更快）

## 项目介绍

抹茶聊天是一个 IM 项目，通过 netty 实现和前端的 websocket 连接。内含微信扫描登录，成员列表，上下线动画，消息列表，消息互动，还有很多实用的小轮子列如 aop 日志，分布式锁注解，频控注解，ip 解析归属地等，持续更新中。。。

### 项目演示

### 项目启动及部署

- 环境: node 16.18+, 包管理工具 pnpm (安装完 node 执行 `npm i pnpm -g` 即可);
- 安装依赖: clone 工程之后，执行 `pnpm i`
  - `npm` 安装报错, 命令后加参数 `npm i --ignore-scripts` 忽略 `scripts` 相关依赖即可解决
    ![p9211Ag.png](https://s1.ax1x.com/2023/08/25/pPNP6RU.png)
  - 推荐使用 `pnpm`, 安装依赖不会有 因为网络而失败 的问题
- 启动: 按 `F5` 即可自动执行 `pnpm run dev` 并且打开浏览器
- 部署
  - 部署到本地：执行 `pnpm build` 构建完成后把 `dist` 文件夹 放到服务器，并配置 `nginx` 即可
  - 自动 CI/CD：通过 `github actions` 在代码提交到 GitHub 之后自动构建并部署到服务器, 详细参考可查看 [deploy.yml](.github/workflows/deploy.yml)

#### C 端项目

- 前端项目地址：[https://github.com/Evansy/MallChatWeb](https://github.com/Evansy/MallChatWeb)
- 项目演示地址：[https://mallchat.cn](https://mallchat.cn) (记住 抹茶.cn，下次工作摸鱼可直接打开)

![p92nKne.png](https://s1.ax1x.com/2023/05/15/p92nKne.png)

### 技术选型

#### 前端技术

|     技术     | 说明                                      | 官网                                                           |
| :----------: | ----------------------------------------- | -------------------------------------------------------------- |
|     Vue3     | 前端流行开发框架                          | [https://cn.vuejs.org](https://cn.vuejs.org)                   |
|    Pinia     | vue3 官方推荐状态管理框架                 | [https://pinia.vuejs.org](https://pinia.vuejs.org)             |
|  vue-router  | Vue 的官方路由                            | [https://router.vuejs.org](https://router.vuejs.org)           |
|  TypeScript  | 让 JS 具备类型声明                        | https://www.typescriptlang.org/                                |
| Element Plus | 缓基于 vue3 的组件库                      | [https://element-plus.gitee.io](https://element-plus.gitee.io) |
|    Alova     | 轻量级的请求策略库，用起来负担比 axios 小 | https://alova.js.org/                                          |
|     vite     | 极速的前端打包构建工具                    | [https://cn.vitejs.dev](https://cn.vitejs.dev)                 |
|     pnpm     | 速度快、节省磁盘空间的软件包管理器        | [https://www.pnpm.cn](https://www.pnpm.cn)                     |

#### 后端技术

见 [MallChat](https://github.com/zongzibinbin/MallChat#后端技术)

### 后端环境搭建

在项目目录下的`application.yml`修改自己的启动环境`spring.profiles.active` = `test`然后找到同级文件`application-test.properties`，填写自己的环境配置。[星球成员](https://www.yuque.com/snab/planet/cne0nel2hny8eu4i)提供一套测试环境配置，可直连

### 项目文档

保姆级教学路线，环境搭建、核心功能、性能优化、埋点上报、问题记录、项目亮点一个不落。点击 [项目文档](https://www.yuque.com/snab/planet/cef1mcko4fve0ur3)

更多有趣功能在持续更新中。。。

![p92Qa2q.png](https://s1.ax1x.com/2023/05/17/p9RcABT.png)

## star 趋势图

![Stargazers over time](https://starchart.cc/Evansy/MallChatWeb.svg)

## 贡献

**贡献之前请先阅读 行为准则 和 贡献指南。感谢所有为 MallChat 做过贡献的人!**

#### 前端:

<a href="https://github.com/Evansy/MallChatWeb/graphs/contributors">
<img src="https://contrib.rocks/image?repo=Evansy/MallChatWeb" />
</a>

#### 后端:

<a href="https://github.com/zongzibinbin/MallChat/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=zongzibinbin/MallChat" />
</a>

<h4>优秀贡献者:</h4>

<table>
  <tr>
    <th>类别</th>
    <th>用户</th>
    <th>贡献模块</th>
  </tr>
  <tr>
    <td rowspan="3">前端</td>
    <td rowspan="3">
      <a href="https://github.com/LIjiAngChen8"><img src="https://avatars.githubusercontent.com/u/48879481?v=4" style=" width: 80px; height: 80px;"></a>
    </td>
    <td><a href="https://github.com/Evansy/MallChatWeb/pull/74">图片、语音、文件类型消息收发</a></td>
  </tr>
  <tr>
    <td><a href="https://github.com/Evansy/MallChatWeb/pull/50">消息互动操作(撤回、点赞、删除)</a></td>
  </tr>
  <tr>
    <td><a href="https://github.com/Evansy/MallChatWeb/pull/17">虚拟列表</a></td>
  </tr>
  <tr>
    <td rowspan="5">后端</td>
    <td rowspan="2">
      <a href="https://github.com/1045078399"><img src="https://avatars.githubusercontent.com/u/82020261?v=4" style=" width: 80px; height: 80px;"></a>
    </td>
    <td><a href="https://github.com/zongzibinbin/MallChat/pull/31">DFA敏感词检测</a></td>
  </tr>
  <tr>
    <td><a href="https://github.com/zongzibinbin/MallChat/pull/64">OpenAI聊天机器人</a></td>
  </tr>
  <tr>
    <td rowspan="1">
      <a href="https://github.com/xiaocairush"><img src="https://avatars.githubusercontent.com/u/6416523?v=4" style=" width: 80px; height: 80px;"></a>
    </td>
    <td><a href="https://github.com/zongzibinbin/MallChat/pull/99">Ac自动机敏感词检测</a></td>
  </tr>
    <tr>
    <td rowspan="1">
      <a href="https://github.com/linzhihan"><img src="https://avatars.githubusercontent.com/u/58815955?v=4" style=" width: 80px; height: 80px;"></a>
    </td>
    <td><a href="https://github.com/zongzibinbin/MallChat/pull/95">限流编程式</a></td>
  </tr>
    <tr>
    <td rowspan="1">
      <a href="https://github.com/zbzbzzz"><img src="https://avatars.githubusercontent.com/u/42697182?v=4" style=" width: 80px; height: 80px;"></a>
    </td>
    <td><a href="https://github.com/zongzibinbin/MallChat/pull/82">握手认证</a></td>
  </tr>
</table>

## 公众号

微信搜索 **阿斌 Java 之路** 关注我的原创公众号，后台回复「**抹茶**」即可加入抹茶交流群，一些做过公司万人群聊，高并发的小伙伴都在里面讨论方案。公众号也会经常更新项目相关的文档，等你来撩~~

![p9211Ag.png](https://s1.ax1x.com/2023/05/15/p9211Ag.png)
