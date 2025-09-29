import { Company } from '../../../models'
import _ from 'lodash'
import fs from 'fs'

export default async (_req, res) => {
    const answers = JSON.parse(fs.readFileSync('data.json', 'utf-8'))
    const companies = [] as Company[]

    const answersByCompany = _.groupBy(answers, 'company.isin')
    for (const isin of Object.keys(answersByCompany)) {
        const company = _.first(answersByCompany[isin]).company
        companies.push({
            ...company
        })
    }

    return res.status(200).send(companies)
}