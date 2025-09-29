import { Answer, AnswersQuery } from '../../../models'

import fs from 'fs'

export default async (req, res) => {
    const { isin, start, end, ids, user }: AnswersQuery = req.query
    let answers = JSON.parse(fs.readFileSync('data.json', 'utf-8')) as Answer[]

    if (isin) {
        answers = answers.filter(answer => answer.company.isin === isin)
    }
    if (start) {
        answers = answers.filter(answer => new Date(answer.created) > new Date(start))
    }
    if (end) {
        answers = answers.filter(answer => new Date(answer.created) < new Date(end))
    }
    if (ids) {
        answers = answers.filter(answer => ids.split(',').includes(answer.id))
    }
    if (user) {
        answers = answers.filter(answer => answer.user === user)
    }

    return res.status(200).send(answers)
}