import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL ?? 'https://backend.bitflow.com.mx/api'

export type NoteDTO = {
  id: number
  idUser: number
  nota: string
  status: 1 | 2 | 3
  fechaAlta: string
}

export async function getNotesByUser(idUser: number): Promise<NoteDTO[]> {
  const { data } = await axios.get(`${API_URL}/dashboard/notes`, {
    params: { idUser },
  })
  console.log('GET notes idUser:', idUser)
  return data.data ?? []
}

export async function updateNoteStatus(payload: {
  id: number
  idUser: number
  status: 1 | 2 | 3
}): Promise<NoteDTO> {
  const { data } = await axios.patch(`${API_URL}/dashboard/notes/${payload.id}/status`, {
    idUser: payload.idUser,
    status: payload.status,
  })

  return data.data
}

export async function createNote(payload: { idUser: number; nota: string }): Promise<NoteDTO> {
  const { data } = await axios.post(`${API_URL}/dashboard/notes`, payload)
  return data.data
}
