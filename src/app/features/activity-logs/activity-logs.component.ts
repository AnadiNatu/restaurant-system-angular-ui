import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivityLog } from '../../core/models/model';
import { ActivityLogService } from '../../core/services/api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-activity-logs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activity-logs.component.html',
  styleUrl: './activity-logs.component.css'
})
export class ActivityLogsComponent implements OnInit {
private logSvc = inject(ActivityLogService);
 
  loading     = signal(true);
  logs        = signal<ActivityLog[]>([]);
  searchQuery = signal('');
  entityFilter = signal('');
  roleFilter   = signal('');
 
  entityTypes = computed(() =>
    [...new Set(this.logs().map(l => l.entityType).filter(Boolean) as string[])].sort()
  );
 
  filtered = computed(() => {
    let list = this.logs();
    const q = this.searchQuery().toLowerCase();
    if (q) list = list.filter(l =>
      l.actorEmail.toLowerCase().includes(q) ||
      l.action.toLowerCase().includes(q) ||
      l.description?.toLowerCase().includes(q) ||
      l.entityType?.toLowerCase().includes(q)
    );
    if (this.entityFilter()) list = list.filter(l => l.entityType === this.entityFilter());
    if (this.roleFilter()) list = list.filter(l => l.actorRole === this.roleFilter());
    return list;
  });
 
  roleClass(role: string): string {
    const map: Record<string, string> = {
      SUPER_ADMIN: 'badge-super',
      ADMIN:       'badge-amber',
      EMPLOYEE:    'badge-info'
    };
    return map[role] ?? 'badge-info';
  }
 
  ngOnInit(): void { this.load(); }
 
  load(): void {
    this.loading.set(true);
    this.logSvc.getAll().subscribe({
      next:  logs => { this.logs.set(logs); this.loading.set(false); },
      error: ()   => this.loading.set(false)
    });
  }
}
