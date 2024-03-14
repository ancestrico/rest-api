const express = require('express') // ->Usamos el require porque por ahora estamos usando CommonJS
const movies = require('./movies.json')
const crypto = require('node:crypto')
const { validarPeli, validarParcialPeli } = require('./schema.js')
const cors = require('cors')

// const z = require('zod') // -> Instalamos Zod para validaciones
// Creo la app osea la inicializo
const app = express()
app.disable('x-powered-by') // Deshabilita el header X-Powered-By: Express

// middleware para tener de una el body cuando uso un json
app.use(express.json())

app.use(cors({
  origin: (origin, callback) => {
    const acceptedOrigins = [
      'http://localhost:8080',
      'http://localhost:1234',
      'http://localhost:8081',
      'http://localhost:8083'
    ]

    if (acceptedOrigins.includes(origin)) {
      return callback(null, true)
    }

    if (!origin) {
      return callback(null, true)
    }

    return callback(new Error('No permitido por CORS'))
  }
}
))
app.get('/', (req, res) => {
  res.json({ message: 'Hola Mundo' })
})

app.get('/movies', (req, res) => {
  // Posible solucion a acceso CORS manual. Se comenta cuando se instala cors
  // const origen = req.header('origin')
  // if (acceptedOrigins.includes(origen) || !origen) {
  //   res.header('Access-Control-Allow-Origin', origen)
  // }
  const { genre } = req.query

  if (genre) {
    console.log(genre)
    const peliculas = movies.filter(movie => movie.genre.some(d => d.toLowerCase() === genre.toLowerCase()))
    return res.json(peliculas)
  }
  res.json(movies)
})

app.get('/movies/:id', (req, res) => {
  const { id } = req.params
  const pelicula = movies.find(movie => movie.id === id)
  if (pelicula) return res.json(pelicula)

  res.status(404).json({ message: 'Pelicula No encontrada' })
})

app.post('/movies', (req, res) => {
  // Puedes crear el esquema asi
//   const movieSchema = z.object({
//     title: z.string({
//       invalid_type_error: 'Pelicula debe ser alfanumérico',
//       required_error: 'El campo title es obligatorio'
//     }).minLength(3),
//     year: z.number().int().min(1900).max(Date.year),
//     director: z.string({
//       invalid_type_error: 'Director debe ser alfanumérico',
//       required_error: 'El campo director es obligatorio'
//     }),
//     poster: z.string().url(),
//     duration: z.number().int().positive(),
//     rate: z.number().min(0).max(10),
//     genre: z.array().enum(['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Thriller', 'Sci-Fi'])
//   })
// ya no hay necesidad de traerse las cosas uno a uno
// const { title, year, director, duration, posteer, genre, rate } = req.body // -> Fijate que los elementos del post los recupero del body

  const result = validarPeli(req.body)
  if (result.error) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }
  const newMovie = {
    id: crypto.randomUUID(), // crea un uuid version 4
    ...result.data
  }
  movies.push(newMovie)
  res.status(201).json(newMovie)
})

app.patch('/movies/:id', (req, res) => {
  const resultado = validarParcialPeli(req.body)

  if (resultado.error) {
    return res.status(400).json({ error: JSON.parse(resultado.error.message) })
  }

  const { id } = req.params

  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex < 0) {
    return res.status(404).json({ message: 'Pelicula No encontrada' })
  }

  const peliculaActualizada = {
    ...movies[movieIndex],
    ...resultado.data
  }

  movies[movieIndex] = peliculaActualizada
  res.status(202).json(peliculaActualizada)
})

app.delete('/movies/:id', (req, res) => {
  // const origen = req.header('origin')
  // if (acceptedOrigins.includes(origen) || !origen) {
  //   res.header('Access-Control-Allow-Origin', origen)
  //   res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE')
  // }
  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)
  if (movieIndex < 0) {
    return res.status(404).json({ message: 'Pelicula No encontrada' })
  }

  movies.splice(movieIndex, 1)
  res.status(200).json({ message: 'Pelicula borrada' })
})
const PORT = process.env.PORT ?? 8082

app.options('/movies/:id', (req, res) => {
  // const origen = req.header('origin')
  // if (acceptedOrigins.includes(origen) || !origen) {
  //   res.header('Access-Control-Allow-Origin', origen)
  //   res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE')
  // }
  res.send(200)
})
app.listen(PORT, () => {
  console.log(`Escuchando por el puerto ${PORT} `)
})
