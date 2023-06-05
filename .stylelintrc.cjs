module.exports = {
  // 注册 stylelint 的 prettier 插件
  plugins: ['stylelint-prettier'], // 继承一系列规则集合
  extends: [
    // standard 规则集合
    'stylelint-config-standard',
    // standard 规则集合的 scss 版本
    'stylelint-config-standard-scss',
    // 样式属性顺序规则
    'stylelint-config-recess-order',
    // 样式属性 vue 规则
    'stylelint-config-recommended-vue',
    // 样式属性 vue 规则
    'stylelint-config-recommended-vue/scss',
    // 接入 Prettier 规则
    'stylelint-config-prettier',
    'stylelint-prettier/recommended',
  ],
  // 配置 rules
  rules: {
    // 开启 Prettier 自动格式化功能
    'prettier/prettier': true,
    'scss/at-import-partial-extension': null, // 解决不能引入scss文件
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['global', 'v-deep', 'deep'],
      },
    ],
  },
}
