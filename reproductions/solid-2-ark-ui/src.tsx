import { Menu } from "@ark-ui/solid/menu";
import { Toast, Toaster, createToaster } from "@ark-ui/solid/toast";
import { Portal, render } from "@solidjs/web";

const toaster = createToaster({ placement: "bottom-end" });

function App() {
  return (
    <>
      <Menu.Root>
        <Menu.Trigger>Open menu</Menu.Trigger>
        <Portal>
          <Menu.Positioner>
            <Menu.Content>
              <Menu.Item
                value="show-toast"
                onSelect={() => toaster.create({ title: "Menu toast" })}
              >
                Show toast
              </Menu.Item>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
      <Portal>
        <Toaster toaster={toaster}>
          {(toast) => (
            <Toast.Root>
              <Toast.Title>{toast().title}</Toast.Title>
            </Toast.Root>
          )}
        </Toaster>
      </Portal>
    </>
  );
}

const root = document.getElementById("root");
if (root) render(() => <App />, root);
