/*
import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats = {
    totalExpenses: 2450.75,
    monthlyExpenses: 892.5,
    topCategory: 'Food',
    expenseCount: 24,
  };

  recentExpenses: Expense[] = [
    {
      id: 1,
      amount: 45.5,
      category: 'Food',
      description: 'Grocery Shopping',
      date: new Date(),
      categoryColor: '#3B82F6',
    },
    {
      id: 2,
      amount: 120.0,
      category: 'Transport',
      description: 'Gas Station',
      date: new Date(),
      categoryColor: '#EF4444',
    },
    {
      id: 3,
      amount: 25.99,
      category: 'Entertainment',
      description: 'Movie Tickets',
      date: new Date(),
      categoryColor: '#10B981',
    },
    {
      id: 4,
      amount: 89.99,
      category: 'Shopping',
      description: 'Clothing',
      date: new Date(),
      categoryColor: '#F59E0B',
    },
    {
      id: 5,
      amount: 15.5,
      category: 'Food',
      description: 'Coffee Shop',
      date: new Date(),
      categoryColor: '#3B82F6',
    },
  ];

  budgetProgress: Budget[] = [
    {
      id: 1,
      category: 'Food',
      budgetAmount: 500,
      spentAmount: 320,
      percentage: 64,
    },
    {
      id: 2,
      category: 'Transport',
      budgetAmount: 300,
      spentAmount: 285,
      percentage: 95,
    },
    {
      id: 3,
      category: 'Entertainment',
      budgetAmount: 200,
      spentAmount: 150,
      percentage: 75,
    },
    {
      id: 4,
      category: 'Shopping',
      budgetAmount: 250,
      spentAmount: 180,
      percentage: 72,
    },
  ];

  ngOnInit() {
    this.createExpenseChart();
    this.createCategoryChart();
  }

  createExpenseChart() {
    const ctx = document.getElementById('expenseChart') as HTMLCanvasElement;
    if (!ctx) return;

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Monthly Expenses',
            data: [1200, 1350, 1100, 1450, 1600, 892.5],
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function (value) {
                return '$' + value;
              },
            },
          },
        },
      },
    });
  }

  createCategoryChart() {
    const ctx = document.getElementById('categoryChart') as HTMLCanvasElement;
    if (!ctx) return;

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills'],
        datasets: [
          {
            data: [320, 285, 150, 180, 200],
            backgroundColor: [
              '#3B82F6',
              '#EF4444',
              '#10B981',
              '#F59E0B',
              '#8B5CF6',
            ],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 20,
            },
          },
        },
      },
    });
  }
}
*/
