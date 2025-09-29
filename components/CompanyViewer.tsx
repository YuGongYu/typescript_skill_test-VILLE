import { Company } from "../models"

interface CompanyViewerProps {
    companies: Company[]
}

const CompanyViewer = ({companies}: CompanyViewerProps) => <div>
    <h2>There are a few companies:</h2>
    {companies.map(company => <div key={company.id}>
        <h3>{company.title}</h3>
        <h4>{company.isin}</h4>
    </div>)}
</div>

export default CompanyViewer