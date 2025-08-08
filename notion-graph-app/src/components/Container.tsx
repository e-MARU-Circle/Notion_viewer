import React from 'react';

export default function Container({ children }: { children: React.ReactNode }) {
  // ★★★ 作成した 'container-strict' クラスを適用 ★★★
  return (
    <div className="container-strict">
      {children}
    </div>
  );
}