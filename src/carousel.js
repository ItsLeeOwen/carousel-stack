import jss from "jss"
import preset from "jss-preset-default"
import "./carousel.scss"

jss.setup(preset())

const CLASS_CAROUSEL = "ilo-carousel"
const CLASS_CAROUSEL_ANIMATING = `${CLASS_CAROUSEL}--animating`
const CLASS_CAROUSEL_RENDERING = `${CLASS_CAROUSEL}--rendering`
const CLASS_CAROUSEL_ITEM = "ilo-carousel__item"
const CLASS_CAROUSEL_CONTENT = "ilo-carousel__content"
const KEYBOARD_LEFT = 37
const KEYBOARD_RIGHT = 39
const KEYBOARD_ENTER = 13
const KEYBOARD_SPACE = 32

export default function Carousel({
  content,
  contentHeight,
  contentWidth,
  depth = 10,
  ease = "cubic-bezier(0.23, 1, 0.32, 1)",
  element,
  onSelect,
  speed = 750,
}) {
  if (!element) {
    throw new Error("carousel.js opts.element is required")
  }
  if (!contentWidth) {
    throw new Error("carousel.js opts.contentWidth is required")
  }

  // add carousel class and rendering class to prevent initial transition
  element.classList.add(CLASS_CAROUSEL, CLASS_CAROUSEL_RENDERING)

  const styles = {
    iloCarouselItem: {
      height: `${contentHeight}px`,
      width: `${contentWidth}px`,
      transition: `transform ${ease} ${speed}ms`,
    },
  }

  const { classes } = jss.createStyleSheet(styles).attach()

  let goToTimer
  let goToComplete
  let activeIndex = 0

  const items = content.map(content => ({
    content,
  }))

  // delay rendering & removal of rendering by a tick
  setTimeout(() => {
    render()
    reflow()
    element.classList.remove(CLASS_CAROUSEL_RENDERING)

    addKeyboardEvents()
  })

  return {
    goTo,
    next,
    previous,
  }

  // render carousel items
  function render() {
    // iterate through all items, create dom & assign position
    const l = items.length

    // first loop sets immediate positioning
    items.forEach((item, i) => {
      const zIndex = l - i
      const x = activeIndex * -contentWidth
      const z = (i - activeIndex) * -depth

      item.z = z
      item.x = x
      item.zIndex = zIndex

      const translateZ = `translateZ(${item.z}px)`

      if (!item.element) {
        // adding item for the first time
        item.enter = true
        const itemElement = document.createElement("div")
        itemElement.classList.add(classes.iloCarouselItem)
        itemElement.classList.add(CLASS_CAROUSEL_ITEM)
        item.content.element.classList.add(CLASS_CAROUSEL_CONTENT)
        itemElement.appendChild(item.content.element)

        item.onClick = event => onClick(items.indexOf(item))
        itemElement.addEventListener("click", item.onClick)
        item.element = itemElement

        element.appendChild(item.element)
      } else if (!item.element.parentNode) {
        // re-adding a pushed item
        item.enter = true
        item.onClick = event => onClick(items.indexOf(item))
        item.element.addEventListener("click", item.onClick)
        const n = i + 1
        if (n === l) {
          element.appendChild(item.element)
        } else if (items[n].element.parentNode) {
          element.insertBefore(item.element, items[n].element)
        } else {
          element.appendChild(item.element)
        }
      }

      item.element.style.zIndex = zIndex
      item.element.setAttribute("tabindex", i + 1)

      if (item.enter) {
        const translateX = `translateX(${item.x - contentWidth}px)`
        item.element.style.transform = `${translateZ} ${translateX}`
      }
    })

    // flush css layout to dom
    reflow()

    // set positions to transition to
    items.forEach((item, i) => {
      const translateX = `translateX(${item.x}px)`
      const translateZ = `translateZ(${item.z}px)`

      item.element.style.transform = `${translateZ} ${translateX}`
    })
  }

  // on item click
  function onClick(index) {
    goTo(index)
  }

  function next() {
    goTo(activeIndex + 1)
  }

  function previous() {
    const popped = items.pop()
    element.removeChild(popped.element)

    if (goToTimer) {
      // cancel previous timeout
      clearTimeout(goToTimer)
      goToComplete()
    }

    if ("function" === typeof onSelect) {
      onSelect(popped.content)
    }

    // prevent hover interactions while animating
    element.classList.add(CLASS_CAROUSEL_ANIMATING)

    items.unshift({
      ...popped,
      element: popped.element.cloneNode(true),
    })

    element.classList.add(CLASS_CAROUSEL_RENDERING)
    reflow()

    activeIndex = 1

    render()
    reflow()

    activeIndex = 0

    element.classList.remove(CLASS_CAROUSEL_RENDERING)

    render()
  }

  function goTo(index) {
    if (goToTimer) {
      // cancel previous timeout
      clearTimeout(goToTimer)
    }

    const item = items[index]

    if ("function" === typeof onSelect) {
      onSelect(item.content)
    }

    // prevent hover interactions while animating
    element.classList.add(CLASS_CAROUSEL_ANIMATING)

    const pushing = items.slice(activeIndex, index).map(item => ({
      ...item,
      element: item.element.cloneNode(true),
    }))

    items.push(...pushing)

    activeIndex = index

    render()

    goToComplete = () => {
      goToTimer = undefined
      element.classList.add(CLASS_CAROUSEL_RENDERING)
      activeIndex = 0
      items.splice(0, index).forEach(item => element.removeChild(item.element))
      render()
      reflow()
      element.classList.remove(CLASS_CAROUSEL_RENDERING)
      element.classList.remove(CLASS_CAROUSEL_ANIMATING)
    }

    goToTimer = setTimeout(goToComplete, speed)
  }

  function addKeyboardEvents() {
    document.addEventListener(
      "keydown",
      event => {
        switch (event.which) {
          case KEYBOARD_LEFT:
            previous()
            break

          case KEYBOARD_RIGHT:
            next()
            break

          case KEYBOARD_ENTER:
          case KEYBOARD_SPACE:
            event.preventDefault()
            const activeElement = document.activeElement
            if (
              activeElement.classList.contains(CLASS_CAROUSEL_ITEM) &&
              activeElement.parentNode === element
            ) {
              const tabIndex = activeElement.getAttribute("tabindex")
              goTo(Number(tabIndex) - 1)
            }
            break
        }
      },
      false
    )
  }
}

// flush class/style changes to dom
function reflow() {
  document.body.offsetHeight
}
