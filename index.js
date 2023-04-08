const BASE_URL = "https://movie-list.alphacamp.io"
const INDEX_URL = BASE_URL + "/api/v1/movies/"
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

const movies = []
let filteredMoives = []
const dataPanel = document.querySelector('#data-panel')
//會將監聽器綁在form元素，因為該元素會有一個事件是'submit'，這是我們所需的
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')


function renderMovieList(data) {
  let rawHTML = ''

  data.forEach((item) => {
    //需要title 和 imge
    rawHTML += `
          <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie posters">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer ">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
                data-bs-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>
    `
  })

  dataPanel.innerHTML = rawHTML
}

function renderPaginator(amount) {
  //用Math.ceil進行無條件進位
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''
  for (let page = 0; page < numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page + 1}">${page + 1}</a></li>`
  }

  paginator.innerHTML = rawHTML
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id).then(res => {
    const data = res.data.results
    modalTitle.innerText = data.title
    modalImage.innerHTML = `<img
                src="${POSTER_URL + data.image}"
                alt="movie-poster" class="img-fuid">`
    modalDate.innerText = 'Release date:' + data.release_date
    modalDescription.innerText = data.description
  })
}

//得到頁碼(page)後，算出movies陣列的值位置
//如page = 1 slice要放 (0,11) page = 2 slice要放 (12,23) ... etc
function getMoviesByPage(page) {

  const data = filteredMoives.length ? filteredMoives : movies

  const StarIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(StarIndex, StarIndex + MOVIES_PER_PAGE)
}

function addToFavorite(id) {
  function isMovieIdMatched(movie) {
    return movie.id === id
  }

  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  // const movie = movies.find(isMovieIdMatched)
  const movie = movies.find(movie => movie.id === id)

  if (list.some(isMovieIdMatched)) {
    return alert('此電影已經在收藏清單中!')
  }

  list.push(movie)

  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

paginator.addEventListener('click', function onPaginatorClicked(event) {
  //判斷是否可以點到<a>標籤
  if (event.target.tagName !== 'A') {
    return
  }
  const page = Number(event.target.dataset.page)
  renderMovieList(getMoviesByPage(page))
})

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

searchForm.addEventListener('submit', function onSearchFormSubmiited(event) {
  //因為提交submit瀏覽器會預設刷新頁面，所以可以用preventDefault讓瀏覽器不要進行預設動作
  event.preventDefault()
  //input 屬性可透過'.value'取得輸入的內容，並且用'toLowerCase'轉換成小寫，來解決輸入大或小寫找電影的情況
  const keyword = searchInput.value.trim().toLowerCase()
  //存放搜尋完成的解果

  //增加判斷式排除未輸入任何字源的情況
  if (!keyword.length) {
    return alert('Please enter a valid string')
  }

  //在'filter'函式裡面可以放條件函式,若條件式ture,會將符合條件的資料帶出
  filteredMoives = movies.filter((movie) => movie.title.toLowerCase().includes(keyword))
  //增加一個當找不到電影時可跳出之視窗，並且透過return 結束搜尋的動作以避免清單被render
  if (filteredMoives.length === 0) {
    return alert('Cannot find movies with keyword:' + ' " ' + keyword + ' " ')
  }

  //  判斷關鍵字是否存在於movies的另一方法
  // for (const movie of movies) {
  //   if (movie.title.toLowerCase().includes(keyword)) {
  //     filteredMoives.push(movie)
  //   }
  // }

  renderMovieList(getMoviesByPage(1))
  renderPaginator(filteredMoives.length)
})

axios.get(INDEX_URL).then(res => {
  // for (let key in res.data.results) {
  //   movie.push(res.data.results[key])
  // }
  movies.push(...res.data.results) //...同上面for迴圈作用
  renderMovieList(getMoviesByPage(1))  //讓預設render第一頁
  renderPaginator(movies.length)
})
  .catch((err) => console.log(err))




