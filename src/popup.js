/* global chrome */
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "openArticle" }] */

const getCookie = (url, name) => new Promise((resolve) => chrome.cookies.get({ url, name }, (cookie) => resolve(cookie)))
const setBadgeText = (text) => new Promise((resolve) => chrome.browserAction.setBadgeText({ text }, () => resolve(true)))
const setCookie = (url, name, value) => new Promise((resolve) => chrome.cookies.set({ url, name, value }, () => resolve(true)))

window.onload = async () => {
  let currentNews = await getCookie('https://spaceflightnow.com/category/news-archive', 'latestNews')
  if (!currentNews) {
    currentNews = '{"items": [], "new": 0, "errors": []}'
    await setCookie('https://spaceflightnow.com/category/news-archive', 'latestNews', currentNews)
  } else {
    currentNews = currentNews.value
  }
  currentNews = JSON.parse(currentNews)
  if (currentNews.errors && currentNews.errors.length) {
    document.getElementById('errors-container').innerHTML = currentNews.errors[0]
  }
  currentNews.errors = []
  let newsContainer = document.getElementById('news-container')
  if (!currentNews.items.length) {
    newsContainer.innerHTML = 'No news to display.'
  } else {
    newsContainer.innerHTML = ''
    currentNews.items.forEach((item) => {
      if (!item) {
        return
      }
      newsContainer.innerHTML +=
        `<div class='news-item' link='${item.link}'>` +
          (item.new ? `<div class='new-item-icon'></div>` : '') +
          `<img class='news-item-image' src='${item.imageLink}'></img>` +
          `<div class='news-item-data-container'>` +
            `<div class='news-item-title'>${item.title}</div>` +
            `<div class='news-item-text'>${item.text}</div>` +
          `</div>` +
        `</div>`
      if (item.new) {
        item.new = false
      }
    })
    const newsItems = newsContainer.getElementsByClassName('news-item')
    for (const i in newsItems) {
      const element = newsItems[i]
      if ((typeof element.tagName !== 'string') || (element.tagName.toLowerCase() !== 'div')) {
        continue
      }
      element.onclick = () => {
        window.open(element.attributes.link.value, 'blank')
      }
    }
  }
  if (currentNews.new > 0) {
    if (currentNews.new > 8) {
      document.getElementById('more-news-info').innerHTML = `<a href='https://spaceflightnow.com/category/news-archive' target='_blank'>+ ${currentNews.new - 8} items not shown here</a>`
    }
    currentNews.new = 0
    await setBadgeText('')
    await setCookie('https://spaceflightnow.com/category/news-archive', 'latestNews', JSON.stringify(currentNews))
  }
}
