export const calculateCycleDetails = (startDate: string) => {
    const start = new Date(startDate);
    const ovulation = new Date(start);
    ovulation.setDate(start.getDate() + 14); // Giả sử rụng trứng ngày 14
  
    const fertileStart = new Date(ovulation);
    fertileStart.setDate(ovulation.getDate() - 3);
  
    const fertileEnd = new Date(ovulation);
    fertileEnd.setDate(ovulation.getDate() + 1);
  
    const pillReminder = new Date(start);
    pillReminder.setDate(start.getDate() + 5);
  
    return {
      ovulation,
      fertileStart,
      fertileEnd,
      pillReminder,
    };
  };
  