/**
 * @file 虚拟滚动核心逻辑文件 - (构造函数)
 * @description 主要用于虚拟滚动计算和管理
 * @param {Object} param 定制参数
 * @param {Function} callUpdate 回调
 */
// @ts-nocheck
export default class Virtual {
  sizes: Map<string, number> = new Map<string, number>() // 存储元素的尺寸的Map对象
  offset: number

  constructor(param, callUpdate) {
    this.init(param, callUpdate)
  }

  /**
   * 初始化
   * @param {object} param - 参数对象
   * @param {function} callUpdate - 更新回调函数
   */
  init(param, callUpdate) {
    this.param = param
    this.callUpdate = callUpdate

    this.sizes = new Map()
    this.firstRangeTotalSize = 0
    this.firstRangeAverageSize = 0
    this.lastCalcIndex = 0
    this.fixedSizeValue = 0
    this.calcType = 'INIT'

    this.offset = 0
    this.direction = ''

    this.range = Object.create(null)
    if (param) {
      this.checkRange(0, param.keeps - 1)
    }
  }

  // 销毁整个虚拟列表实例
  destroy() {
    this.init(null, null)
  }

  /**
   * 获取当前范围
   * @returns {object} - 当前范围对象
   */
  getRange() {
    const range = Object.create(null)
    range.start = this.range.start
    range.end = this.range.end
    range.padFront = this.range.padFront
    range.padBehind = this.range.padBehind
    return range
  }

  isBehind() {
    return this.direction === 'BEHIND'
  }

  isFront() {
    return this.direction === 'FRONT'
  }

  getOffset(start) {
    return (start < 1 ? 0 : this.getIndexOffset(start)) + this.param.slotHeaderSize
  }

  // 更新参数
  updateParam(key, value) {
    if (this.param && key in this.param) {
      if (key === 'uniqueIds') {
        this.sizes.forEach((v, key) => {
          if (!value.includes(key)) {
            this.sizes.delete(key)
          }
        })
      }
      this.param[key] = value
    }
  }

  /**
   * 保存元素的尺寸
   * @param {string} id - 唯一标识
   * @param {number} size - 尺寸
   * @description 该方法用于保存数据项的尺寸信息。将指定id和尺寸保存到`sizes`映射中，以便后续使用
   */
  saveSize(id, size) {
    this.sizes.set(id, size)

    // 如果当前计算类型为初始化(INIT) 将尺寸值设为固定尺寸值，并将计算类型设置为固定
    if (this.calcType === 'INIT') {
      this.fixedSizeValue = size
      this.calcType = 'FIXED'
      // 如果当前计算类型固定并且固定尺寸值不等于新的尺寸
    } else if (this.calcType === 'FIXED' && this.fixedSizeValue !== size) {
      this.calcType = 'DYNAMIC'
      delete this.fixedSizeValue // 删除固定尺寸值
    }

    if (this.calcType !== 'FIXED' && typeof this.firstRangeTotalSize !== 'undefined') {
      // 如果sizes映射的大小小于参数keeps和uniqueIds长度的最小值 这么做的目的是为了计算平均尺寸
      if (this.sizes.size < Math.min(this.param.keeps, this.param.uniqueIds.length)) {
        // 第一个范围的总尺
        this.firstRangeTotalSize = [...this.sizes.values()].reduce((acc, val) => acc + val, 0)
        // 第一个范围的平均尺寸
        this.firstRangeAverageSize = Math.round(this.firstRangeTotalSize / this.sizes.size)
      } else {
        delete this.firstRangeTotalSize
      }
    }
  }

  /**
   * 数据变化处理
   */
  handleDataSourcesChange() {
    let start = this.range.start

    if (this.isFront()) {
      // 将起始位置向前调整2个单位
      start = start - 2
    } else if (this.isBehind()) {
      // 将起始位置向后调整2个单位
      start = start + 2
    }

    start = Math.max(start, 0) // 确保起始位置不小于0

    this.updateRange(this.range.start, this.getEndByStart(start))
  }

  handleSlotSizeChange() {
    this.handleDataSourcesChange()
  }

  /**
   * 滚动处理
   * @param offset 偏移量
   * @description 根据滚动的偏移量判断滚动的方向是向前还是向后
   */
  handleScroll(offset) {
    this.direction = offset < this.offset ? 'FRONT' : 'BEHIND'
    this.offset = offset

    if (!this.param) {
      return
    }

    if (this.direction === 'FRONT') {
      this.handleFront()
    } else if (this.direction === 'BEHIND') {
      this.handleBehind()
    }
  }

  /**
   * 向前滚动处理
   * @returns {number} 滚动的位置
   */
  handleFront() {
    const overs = this.getScrollOvers()
    if (overs > this.range.start) {
      return
    }

    const start = Math.max(overs - this.param.buffer, 0)
    this.checkRange(start, this.getEndByStart(start))
  }

  /**
   * 向后滚动处理
   * @returns {number} 滚动的位置
   */
  handleBehind() {
    const overs = this.getScrollOvers()
    if (overs < this.range.start + this.param.buffer) {
      return
    }

    this.checkRange(overs, this.getEndByStart(overs))
  }

  /**
   * 获取滚动的位置
   * @returns {number} 滚动的位置
   */
  getScrollOvers() {
    const offset = this.offset - this.param.slotHeaderSize
    if (offset <= 0) {
      return 0
    }

    if (this.isFixedType()) {
      return Math.floor(offset / this.fixedSizeValue)
    }

    let low = 0
    let middle = 0
    let middleOffset = 0
    let high = this.param.uniqueIds.length

    while (low <= high) {
      middle = low + Math.floor((high - low) / 2)
      middleOffset = this.getIndexOffset(middle)

      if (middleOffset === offset) {
        return middle
      } else if (middleOffset < offset) {
        low = middle + 1
      } else if (middleOffset > offset) {
        high = middle - 1
      }
    }

    return low > 0 ? --low : 0
  }

  /**
   * 获取指定索引的偏移量
   * @param {number} givenIndex - 给定的索引
   * @returns {number} - 偏移量
   */
  getIndexOffset(givenIndex) {
    if (!givenIndex) {
      return 0
    }

    let offset = 0
    let indexSize = 0
    for (let index = 0; index < givenIndex; index++) {
      indexSize = this.sizes.get(this.param.uniqueIds[index])
      offset = offset + (typeof indexSize === 'number' ? indexSize : this.getEstimateSize())
    }

    this.lastCalcIndex = Math.max(this.lastCalcIndex, givenIndex - 1)
    this.lastCalcIndex = Math.min(this.lastCalcIndex, this.getLastIndex())

    return offset
  }

  isFixedType() {
    return this.calcType === 'FIXED'
  }

  getLastIndex() {
    return this.param.uniqueIds.length - 1
  }

  checkRange(start, end) {
    const keeps = this.param.keeps
    const total = this.param.uniqueIds.length

    if (total <= keeps) {
      start = 0
      end = this.getLastIndex()
    } else if (end - start < keeps - 1) {
      start = end - keeps + 1
    }

    if (this.range.start !== start) {
      this.updateRange(start, end)
    }
  }

  // 更新范围
  updateRange(start, end) {
    this.range.start = start
    this.range.end = end
    this.range.padFront = this.getPadFront()
    this.range.padBehind = this.getPadBehind()
    this.callUpdate(this.getRange())
  }

  getEndByStart(start) {
    const theoryEnd = start + this.param.keeps - 1
    const truelyEnd = Math.min(theoryEnd, this.getLastIndex())
    return truelyEnd
  }

  // 获取前方的预填充大小
  getPadFront() {
    if (this.isFixedType()) {
      return this.fixedSizeValue * this.range.start
    } else {
      return this.getIndexOffset(this.range.start)
    }
  }

  /**
   * 获取后方的预填充大小
   * @returns {number} - 填充大小
   */
  getPadBehind() {
    const end = this.range.end // 当前显示范围的结束索引
    const lastIndex = this.getLastIndex() // 最后一个索引

    // 如果是固定尺寸类型就直接返回固定尺寸的填充大小
    if (this.isFixedType()) {
      return (lastIndex - end) * this.fixedSizeValue
    }

    // 如果上一次计算的索引等于最后一个索引，则返回当前索引的偏移量减去结束索引的偏移量
    if (this.lastCalcIndex === lastIndex) {
      return this.getIndexOffset(lastIndex) - this.getIndexOffset(end)
    } else {
      // 否则返回预估尺寸乘以剩余元素个数的填充尺寸
      return (lastIndex - end) * this.getEstimateSize()
    }
  }

  getEstimateSize() {
    return this.isFixedType()
      ? this.fixedSizeValue
      : this.firstRangeAverageSize || this.param.estimateSize
  }
}
