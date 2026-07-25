import React from 'react';
import {
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
} from '@mui/material';

const CustomTable = ({ columns = [], data = [], emptyMessage = 'No data available' }) => {
  return (
    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: '12px' }}>
      <MuiTable sx={{ minWidth: 650 }}>
        <TableHead sx={{ backgroundColor: '#F8FAFC' }}>
          <TableRow>
            {columns.map((col, index) => (
              <TableCell
                key={index}
                align={col.align || 'left'}
                sx={{ fontWeight: 600, color: '#0F172A', fontSize: '0.8125rem', py: 2 }}
              >
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <TableRow key={rowIndex} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                {columns.map((col, colIndex) => (
                  <TableCell key={colIndex} align={col.align || 'left'} sx={{ py: 2 }}>
                    {col.render ? col.render(row) : row[col.field]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                <Typography variant="body2" color="#64748B">
                  {emptyMessage}
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </MuiTable>
    </TableContainer>
  );
};

export default CustomTable;
