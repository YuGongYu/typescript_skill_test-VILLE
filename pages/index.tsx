import { Answer, Company } from "../models";
import { useEffect, useState } from "react";

import CompanyViewer from "../components/CompanyViewer";
import axios from "axios";

const Home = () => {
  const [companies, setCompanies] = useState(
    undefined as Company[] | undefined
  );
  const [answers, setAnswers] = useState(undefined as Answer[] | undefined);
  useEffect(() => {
    axios.get("/api/companies").then((response) => setCompanies(response.data));
    axios.get("/api/answers").then((response) => setAnswers(response.data));
  }, []);
  return (
    <div>
      <h1>Home</h1>
      {companies && <CompanyViewer companies={companies} />}
      {answers && (
        <p>There is a total of {answers.length} answers in the dataset.</p>
      )}
    </div>
  );
};

export default Home;
