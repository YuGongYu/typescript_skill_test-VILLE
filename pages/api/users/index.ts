import _ from 'lodash'
import fs from 'fs'

export default async (_req, res) => {
    const answers = JSON.parse(fs.readFileSync('data.json', 'utf-8'))
    const users = [] as { user: string, answers: number }[]

    const answersByUser = _.groupBy(answers, 'user')
    for (const user of Object.keys(answersByUser)) {
        users.push({
            user,
            answers: answersByUser[user].length
        })
    }

    return res.status(200).send(users)
}