import { Link } from "react-router-dom";


function HomeComponent() {
  return (
    <div>
      <h1>Home Component</h1>
      <Link to="/form" className="btn btn-outline-primary btn-sm">Proceed to Demo</Link>
    </div>
  );
}

export default HomeComponent;