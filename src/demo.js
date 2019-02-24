import Carousel from "./carousel"
import "./demo.scss"

document.addEventListener("DOMContentLoaded", () => {
  const carousel = document.querySelector(".my-carousel")

  const content = [
    { image: "asset/poster/terminator.jpg", name: "terminator" },
    { image: "asset/poster/pulpfiction.jpg", name: "pulpfiction" },
    { image: "asset/poster/scarface.jpg", name: "scarface" },
    { image: "asset/poster/ghostbusters.jpg", name: "ghostbusters" },
    { image: "asset/poster/goonies.jpg", name: "goonies" },
    { image: "asset/poster/terminator.jpg", name: "terminator" },
    { image: "asset/poster/pulpfiction.jpg", name: "pulpfiction" },
    { image: "asset/poster/scarface.jpg", name: "scarface" },
    { image: "asset/poster/ghostbusters.jpg", name: "ghostbusters" },
    { image: "asset/poster/goonies.jpg", name: "goonies" },
  ].map(item => {
    const element = document.createElement("div")
    element.style.backgroundImage = `url("${item.image}")`
    return {
      element,
      data: item,
    }
  })

  new Carousel({
    carousel,
    content,
    contentHeight: 550,
    contentWidth: 365,
    onSelect: selected => {
      console.log("onSelect", selected)
    },
  })
})
