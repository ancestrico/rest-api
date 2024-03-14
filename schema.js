const z = require('zod')

const movieSchema = z.object({
  title: z.string({
    invalid_type_error: 'Pelicula debe ser alfanumérico',
    required_error: 'El campo title es obligatorio'
  }).min(3),
  year: z.number().int().min(1900).max(Date.year),
  director: z.string({
    invalid_type_error: 'Director debe ser alfanumérico',
    required_error: 'El campo director es obligatorio'
  }),
  poster: z.string().url(),
  duration: z.number().int().positive(),
  rate: z.number().min(0).max(10),
  genre: z.array(z.enum(['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Thriller', 'Sci-Fi']))
})

function validarPeli (object) {
  return movieSchema.safeParse(object)
}
// Esta me sirve para validar parcialmente un esquema. Básicamente convierte todos los
// parametros en opcionales. Si no están, no pasa nada. Pero si están, los valida como es
function validarParcialPeli (object) {
  return movieSchema.partial().safeParse(object)
}

module.exports = { validarPeli, validarParcialPeli }
