export interface AnswerByIdQuery {
    id: string // ID of the answer
}

export interface ScoreByIsinQuery {
    isin: string // ISIN of the target company
    date?: string //  date of the score
}

export interface AnswersQuery {
    isin?: string // ISIN of the target company
    start?: string // start date of the query
    end?: string // end date of the query
    ids?: string // ids of the answers to include, separated by a comma
    user?: string // ids of the answers to include, separated by a comma
}

export interface Answer {
    value: number
    source: string
    created: string // for example "2021-01-16T11:51:59.000Z"
    skip: boolean
    id: string
    user: string
    company: Company
    question: Question
}

export interface Company {
    standby: false
    title: string
    tid: number
    isin: string
    id: number
}

export interface Question {
    fullText: string
    shortText: string
    tag: string
    id: string
    isPublic: boolean
    isActive: boolean
    translations?: Record<string, Partial<Question>>
}