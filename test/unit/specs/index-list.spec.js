import Vue from 'vue2'
import IndexList from '@/modules/index-list'
import instantiateComponent from '@/common/helpers/instantiate-component'
import { dispatchSwipe } from '../utils/event'

import cityData from '../fake/index-list.json'
// 处理数据
let data = []
cityData.forEach((cityGroup) => {
  let group = {}
  group.name = cityGroup.name
  group.items = []
  cityGroup.cities.forEach((city) => {
    let item = {}
    item.name = city.name
    item.value = city.cityid
    group.items.push(item)
  })
  data.push(group)
})
const title = '当前城市：北京市'
describe('IndexList', () => {
  describe('IndexList.vue', () => {
    let vm
    afterEach(() => {
      if (vm) {
        vm.$parent.destroy()
        vm = null
      }
    })
    it('use', () => {
      Vue.use(IndexList)
      expect(Vue.component(IndexList.name))
        .to.be.a('function')
    })
    it('should render correct contents', () => {
      vm = createIndexList()
      expect(vm.$el.querySelector('.cube-index-list-title').textContent.trim())
        .to.equal('当前城市：北京市')
      const navItems = vm.$el.querySelectorAll('.cube-index-list-nav li')
      expect(navItems.length)
        .to.equal(9)
      expect(navItems[2].textContent)
        .to.equal('B')
      const anchorItems = vm.$el.querySelectorAll('.cube-index-list-content .cube-index-list-anchor')
      expect(anchorItems.length)
        .to.equal(9)
      expect(anchorItems[4].textContent)
        .to.equal('E')

      const items = vm.$el.querySelectorAll('.cube-index-list-item')
      expect(items.length)
        .to.equal(21)
      expect(items[items.length - 1].textContent.trim())
        .to.equal('中卫市')
    })

    it('should trigger events', () => {
      const selectHandler = sinon.spy()
      const titleClickHandler = sinon.spy()

      vm = createIndexList({
        select: selectHandler,
        'title-click': titleClickHandler
      })
      const items = vm.$el.querySelectorAll('.cube-index-list-item')
      items[2].click()
      expect(selectHandler)
        .to.be.calledWith(data[1].items[0])

      vm.$el.querySelector('.cube-index-list-title').click()
      expect(titleClickHandler)
        .to.be.calledWith(title)
    })

    it('should fixed title', function () {
      this.timeout(10000)
      vm = createIndexList({}, [])
      return new Promise((resolve) => {
        setTimeout(() => {
          vm.$parent.updateRenderData({
            props: {
              title: title,
              data: data
            },
            on: {}
          })
          vm.$parent.$forceUpdate()
        }, 30)
        setTimeout(() => {
          const zEle = vm.$el.querySelector('.cube-index-list-nav li[data-index="2"]')
          // nav li
          dispatchSwipe(zEle, {
            pageX: 342,
            pageY: 327
          }, 0)
          setTimeout(() => {
            // item active class
            dispatchSwipe(vm.$el.querySelector('.cube-index-list-item'), {
              pageX: 342,
              pageY: 327
            }, 0)
            // scroll
            const fixedEle = vm.$el.querySelector('.cube-index-list-fixed')
            expect(fixedEle.textContent.trim())
              .to.equal('B')
            const el = vm.$el.querySelector('.cube-index-list-content')
            vm.$refs.indexList.scroll.on('scrollEnd', () => {
              expect(fixedEle.textContent.trim())
                .to.equal('C')
              resolve()
            })
            dispatchSwipe(el, [
              {
                pageX: 300,
                pageY: 400
              },
              {
                pageX: 300,
                pageY: 380
              }
            ], 100)
          }, 20)
        }, 150)
      })
    })

    it('should handle condition of unexpected param', function () {
      this.timeout(10000)
      vm = createIndexList()
      return new Promise((resolve) => {
        setTimeout(() => {
          const bEl = vm.$el.querySelector('.cube-index-list-nav li[data-index="2"]')
          dispatchSwipe(bEl, [
            {
              pageX: 300,
              pageY: 400
            },
            {
              pageX: 300,
              pageY: 50
            }
          ], 100)
          setTimeout(() => {
            const fixedEl = vm.$el.querySelector('.cube-index-list-fixed')
            expect(fixedEl.textContent.trim())
              .to.equal('★热门城市')

            dispatchSwipe(bEl, [
              {
                pageX: 300,
                pageY: 400
              },
              {
                pageX: 300,
                pageY: 1000
              }
            ], 100)
            setTimeout(() => {
              expect(fixedEl.textContent.trim())
                .to.equal('Z')
              resolve()
            }, 150)
          }, 150)

          vm.scrollY = 0
          setTimeout(() => {
            vm.scrollY = -10000
          }, 0)
        }, 30)
      })
    })

    function createIndexList (events = {}, _data = data) {
      const props = {title: title, data: _data}
      return instantiateComponent(Vue, IndexList, {
        props: props,
        on: events
      })
    }
  })
})
