import { Answer, AnswerByIdQuery } from "../../../models"

import _ from "lodash"
import fs from 'fs'

export default async (req, res) => {
    const { id }: AnswerByIdQuery = req.query

    const answers = JSON.parse(fs.readFileSync('data.json', 'utf-8'))

    const answer: Answer = _.find(answers, { id })
    return res.status(200).send(answer)
}