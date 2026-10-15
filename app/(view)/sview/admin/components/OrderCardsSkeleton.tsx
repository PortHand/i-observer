/** Placeholder cards in the order cards' shape, shown while a list loads. */
export default function OrderCardsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <ul className="order-cards" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <li key={index} className="order-card order-card--skeleton">
          <div className="order-card__head">
            <span className="skeleton skeleton--avatar" />
            <span className="order-card__who">
              <span className="skeleton skeleton--line" style={{ width: "70%" }} />
              <span className="skeleton skeleton--line skeleton--small" style={{ width: "40%" }} />
            </span>
          </div>
          <div className="order-card__money">
            <span className="order-card__figure">
              <span className="skeleton skeleton--figure" />
              <span className="skeleton skeleton--line skeleton--small" style={{ width: "90px" }} />
            </span>
            <span className="skeleton skeleton--badge" />
          </div>
          <div className="order-card__facts">
            <span className="skeleton skeleton--line skeleton--small" style={{ width: "60%" }} />
            <span className="skeleton skeleton--line skeleton--small" style={{ width: "80%" }} />
          </div>
          <div className="order-card__foot">
            <span className="skeleton skeleton--line skeleton--small" style={{ width: "110px" }} />
            <span className="skeleton skeleton--line skeleton--small" style={{ width: "60px" }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
