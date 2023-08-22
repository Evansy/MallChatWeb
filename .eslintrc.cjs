require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier/skip-formatting',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'vue/multi-word-component-names': [0],
    'vue/require-default-prop': 0, // 不强制要求props默认值
    'vue/require-direct-export': 1, // 要求导出组件
    'vue/no-v-text': 1, // 禁止使用v-text
    'vue/padding-line-between-blocks': 1, // 在vue组件中，要求在<template>、<script>、<style>之间有空行
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0, // 禁止线上使用debugger
    '@typescript-eslint/no-unused-vars': 1, // 禁止未使用的变量
    '@typescript-eslint/no-empty-function': 1, // 禁止空函数
    '@typescript-eslint/no-explicit-any': 0, // 允许any类型
    'no-param-reassign': 0, // 允许修改函数参数
    'prefer-regex-literals': 0, // 允许使用new RegExp
    'no-unused-vars': 2, // 禁止未使用的变量
  },
}
