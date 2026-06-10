import React from 'react';
import SkeletonText from './SkeletonText';
import SkeletonAvatar from './SkeletonAvatar';

const SkeletonTableRow = ({ columns = 4, hasAvatar = false }) => {
  return (
    <tr className="border-b border-border">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="py-4 px-6">
          {i === 0 && hasAvatar ? (
            <div className="flex items-center space-x-4">
              <SkeletonAvatar size="48px" />
              <SkeletonText lines={1} width="120px" />
            </div>
          ) : (
            <SkeletonText lines={1} width={i === 0 ? "60%" : "80%"} />
          )}
        </td>
      ))}
    </tr>
  );
};

export default SkeletonTableRow;
