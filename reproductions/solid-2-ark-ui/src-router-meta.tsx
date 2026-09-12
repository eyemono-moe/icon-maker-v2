import { Meta } from "@solidjs/meta";
import { createRouter } from "@solidjs/router";
import { render } from "@solidjs/web";

const Router = createRouter({
  routes: [{ path: "/", component: () => <main>Router probe</main> }],
});

function App() {
  return (
    <Router>
      {(props) => (
        <>
          <Meta title="Solid 2 Router and Meta probe" />
          {props.children}
        </>
      )}
    </Router>
  );
}

const root = document.getElementById("root");
if (root) render(() => <App />, root);
