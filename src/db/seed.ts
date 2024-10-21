import dayjs from 'dayjs'
import { client, db } from '.'
import { goalCompletions, goals } from './schema'

async function seed() {
  try {
    // Iniciar uma transação para garantir a consistência
    await db.transaction(async trx => {
      // Deletar completions antes de goals devido à dependência
      await trx.delete(goalCompletions)
      await trx.delete(goals)

      // Inserir novos dados na tabela goals
      const result = await trx
        .insert(goals)
        .values([
          { title: 'Acordar cedo', desiredWeeklyFrequency: 5 },
          { title: 'Fazer exercícios', desiredWeeklyFrequency: 3 },
          { title: 'Estudar inglês', desiredWeeklyFrequency: 7 },
        ])
        .returning()

      // Calcular o início da semana
      const startOfWeek = dayjs().startOf('week')

      // Inserir os completions relacionados às metas criadas
      await trx.insert(goalCompletions).values([
        { goalId: result[0].id, createdAt: startOfWeek.toDate() },
        { goalId: result[1].id, createdAt: startOfWeek.add(1, 'day').toDate() },
        { goalId: result[2].id, createdAt: startOfWeek.add(3, 'day').toDate() },
      ])
    })
  } catch (error) {
    console.error('Erro ao fazer o seed:', error)
  } finally {
    // Fechar a conexão com o banco de dados
    client.end()
  }
}

seed()
