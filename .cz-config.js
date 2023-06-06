module.exports = {
  // type 类型（定义之后，可通过上下键选择）
  types: [
    { value: 'feat', name: '🌟 feat:    新增feature' },
    { value: 'fix', name: '🐛 fix:     修复 bug' },
    { value: 'perf', name: '🚀 perf:    优化相关，比如性能、体验的提升' },
    { value: 'style', name: '🎨 style:   仅仅修改了空格、格式缩进、逗号等等，不改变代码逻辑' },
    { value: 'docs', name: '📝 docs:    仅仅修改了文档，比如README, CHANGELOG, CONTRIBUTE等等;' },
    { value: 'test', name: '👷 test:    测试用例，包括单元测试、集成测试等' },
    { value: 'refactor', name: '🔀 refactor: 代码重构，没有加新功能或者修复bug' },
    { value: 'build', name: '🔨 build:   ' },
    { value: 'ci', name: '🤖 ci:' },
    { value: 'chore', name: 'chore: 改变构建流程、或者增加依赖库、工具等' },
    { value: 'revert', name: '⏪ revert:回滚 commit' },
    { value: 'wip', name: 'wip:' },
    { value: 'workflow', name: 'workflow:' },
    { value: 'types', name: 'types:' },
    { value: 'release', name: 'release:' },
  ],
  // 交互提示信息
  messages: {
    type: '确保本次提交遵循 规范！\n选择你要提交的类型：',
    scope: '\n选择一个 scope（可选）：',
    // 选择 scope: custom 时会出下面的提示
    customScope: '请输入自定义的 scope：',
    subject: '填写简短精炼的变更描述：\n',
    body: '填写更加详细的变更描述（可选）。使用 "|" 换行：\n',
    breaking: '列举非兼容性重大的变更（可选）：\n',
    footer: '列举出所有变更的 ISSUES CLOSED（可选）。 例如: #31, #34：\n',
    confirmCommit: '确认提交？',
  },

  // 设置只有 type 选择了 feat 或 fix，才询问 breaking message
  allowBreakingChanges: ['feat', 'fix'],

  // 跳过要询问的步骤
  // skipQuestions: ['body', 'footer'],

  // subject 限制长度
  subjectLimit: 100,
  breaklineChar: '|', // 支持 body 和 footer
  // footerPrefix : 'ISSUES CLOSED:'
  // askForBreakingChangeFirst : true,
}
