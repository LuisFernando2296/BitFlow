import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createNote, getNotesByUser, updateNoteStatus } from '../../../services/dashboardNotesService'

export const NOTES_KEY = (idUser: number) => ['dashboard-notes', idUser]

export function useNotes(idUser: number) {
  const queryClient = useQueryClient()

  const notesQuery = useQuery({
    queryKey: NOTES_KEY(idUser),
    queryFn: () => getNotesByUser(idUser),
    enabled: !!idUser,
  })

  const createNoteMutation = useMutation({
    mutationKey: ['dashboard-note-create'],
    mutationFn: createNote,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: NOTES_KEY(idUser) }),
  })

  const updateStatusMutation = useMutation({
    mutationKey: ['dashboard-note-status'],
    mutationFn: updateNoteStatus,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: NOTES_KEY(idUser) }),
  })

  return { notesQuery, createNoteMutation, updateStatusMutation }
}
