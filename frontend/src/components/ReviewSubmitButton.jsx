import { useEffect, useState } from 'react';

export default function ReviewSubmitButton({ loading }) {
  const [allSelected, setAllSelected] = useState(false);

  useEffect(() => {
    function checkAllSelected() {
      const memberDropdowns = document.querySelectorAll('.review-member-list .review-dropdown');
      const groupDropdowns = document.querySelectorAll('.review-other-group-list .review-dropdown');
      let allSelected = true;
      memberDropdowns.forEach(select => {
        if (!select.value) allSelected = false;
      });
      groupDropdowns.forEach(select => {
        if (!select.value) allSelected = false;
      });
      setAllSelected(allSelected);
    }
    checkAllSelected();
    document.addEventListener('change', checkAllSelected, true);
    return () => {
      document.removeEventListener('change', checkAllSelected, true);
    };
  }, []);

  return (
      <button
        type="submit"
        className={`review-submit-btn${!allSelected || loading ? ' review-submit-btn-disabled' : ' review-submit-btn-enabled'}`}
        disabled={loading || !allSelected}
      >
        {allSelected ? '提交 Submit' : '請確認所有組員與組別皆已評分\nPlease score every groupmate and group.'}
      </button>
  );
}