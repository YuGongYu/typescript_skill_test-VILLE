import { Answer, ScoreByIsinQuery } from "../../../models"

import _ from "lodash"
import fs from 'fs'

const millisecond = 1
const second = 1000 * millisecond
const minute = 60 * second
const hour = 60 * minute
const day = 24 * hour
const month = 30 * day

export default async (req, res) => {
    const { isin, date }: ScoreByIsinQuery = req.query

    const end = date ? new Date(date) : new Date()
    const start = new Date(+ end - 6 * month)

    let answers: Answer[] = JSON.parse(fs.readFileSync('data.json', 'utf-8'))

    answers = answers
        .filter(answer => answer.company.isin === isin)
        .filter(answer => new Date(answer.created) < end)
        .filter(answer => new Date(answer.created) >= start)
        .filter(answer => answer.skip === false)

    const company = _.first(answers)?.company
    const score = _.meanBy(answers, 'value')

    return res.status(200).send({
        company,
        score,
        date: end
    })
}