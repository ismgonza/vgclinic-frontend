// src/components/staff/ScheduleCalendarView.js
import React from 'react';
import { Card, Row, Col, Badge } from 'react-bootstrap';

const ScheduleCalendarView = ({ schedules }) => {
  // Time slots from 8am to 8pm in 30-minute increments
  const timeSlots = [];
  for (let hour = 8; hour <= 20; hour++) {
    for (let minute of [0, 30]) {
      // Don't add 8:30pm slot
      if (hour === 20 && minute === 30) continue; 
      
      const formattedHour = hour.toString().padStart(2, '0');
      const formattedMinute = minute.toString().padStart(2, '0');
      timeSlots.push(`${formattedHour}:${formattedMinute}`);
    }
  }

  // Days of the week (Monday to Saturday)
  const daysOfWeek = [
    { value: 0, label: 'Monday' },
    { value: 1, label: 'Tuesday' },
    { value: 2, label: 'Wednesday' },
    { value: 3, label: 'Thursday' },
    { value: 4, label: 'Friday' },
    { value: 5, label: 'Saturday' },
  ];

  // Function to check if a schedule exists for a specific day and time slot
  const getScheduleForSlot = (day, timeSlot) => {
    return schedules.find(schedule => {
      const scheduleDay = schedule.day_of_week;
      const startTime = schedule.start_time.substring(0, 5); // HH:MM format
      const endTime = schedule.end_time.substring(0, 5); // HH:MM format
      
      return scheduleDay === day && timeSlot >= startTime && timeSlot < endTime;
    });
  };

  return (
    <Card>
      <Card.Body className="p-0">
        <div className="schedule-calendar">
          <div className="schedule-header">
            <div className="schedule-time-column"></div>
            {daysOfWeek.map(day => (
              <div key={day.value} className="schedule-day-column">
                {day.label}
              </div>
            ))}
          </div>
          
          <div className="schedule-body">
            {timeSlots.map(timeSlot => (
              <div key={timeSlot} className="schedule-row">
                <div className="schedule-time-column">
                  {timeSlot}
                </div>
                {daysOfWeek.map(day => {
                  const schedule = getScheduleForSlot(day.value, timeSlot);
                  
                  return (
                    <div 
                      key={`${day.value}-${timeSlot}`} 
                      className={`schedule-slot ${schedule ? (schedule.is_available ? 'available' : 'unavailable') : 'empty'}`}
                    >
                      {schedule && (
                        <div className="schedule-content">
                          {/* {schedule.is_available ? (<Badge bg="success">Available</Badge>) : (<Badge bg="danger">Unavailable</Badge>)} */}
                          <small className="d-block mt-1">{schedule.location_name}</small>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ScheduleCalendarView;