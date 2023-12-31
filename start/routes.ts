import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  // return some dummy json with 10 users
  return [
    {
      id: 1,
      username: 'johndoe',
      email: 'john@doe.me'
    },
    {
      id: 2,
      username: 'makogai',
      email: 'me@makogai.me'
    }
    ]
})


// Route group for auth
Route.group(() => {
  // Login and Register
  Route.post('/register', 'AuthController.register')
  Route.post('/login', 'AuthController.login')


  // Authenticated routes

  // Get current user
  Route.get('/me', 'AuthController.me').middleware('auth')
  // Update current user
  Route.put('/me', 'AuthController.update').middleware('auth')
}).prefix('/auth');


Route.group(() => {
  Route.get('/', 'StoriesController.index')
  Route.get('/user/:id', 'StoriesController.userStories')
  Route.post('/', 'StoriesController.store')
  Route.delete('/:id', 'StoriesController.destroy')
}).prefix('/stories').middleware('auth')

Route.group(() => {
  Route.get('/posts', 'PostsController.index')
  Route.post('/posts', 'PostsController.store')
  Route.get('/posts/:id', 'PostsController.show')
  Route.patch('/posts/:id', 'PostsController.update')
  Route.delete('/posts/:id', 'PostsController.destroy')
}).middleware('auth') // Assuming you have authentication and want these routes protected.
