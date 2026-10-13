// Shared site layout styles for every public page. Imported once here, not per page: the layout's
// CSS stays loaded across client navigations and always precedes page CSS, so page styles reliably
// override shared ones. Importing it from each page let Next re-insert it after the page CSS when
// navigating, which dropped those overrides until a refresh.
import "./home/home.css";

export default function PublicLayout({ children }: LayoutProps<"/">) {
  return children;
}
