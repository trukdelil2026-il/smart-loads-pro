import * as React from "react";
import { USER_ROLES, type UserRoleKey } from "@/lib/roles";
import { ShieldCheck, User, Users, ChevronDown, CheckCircle2 } from "lucide-react";

interface RoleSwitcherBarProps {
  currentRole: UserRoleKey;
  onSelectRole: (role: UserRoleKey) => void;
}

export function RoleSwitcherBar({ currentRole, onSelectRole }: RoleSwitcherBarProps) {
  const [open, setOpen] = React.useState(false);
  const activeUser = USER_ROLES[currentRole];

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-3 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Current Active Persona Display */}
        <div className="flex items-center gap-3">
          <div
            className="grid size-10 place-items-center rounded-xl text-white font-black text-lg shadow-sm"
            style={{ backgroundColor: activeUser.color }}
          >
            {activeUser.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-foreground text-base leading-tight">
                {activeUser.name}
              </span>
              <span
                className="rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white shadow-xs"
                style={{ backgroundColor: activeUser.color }}
              >
                {activeUser.badge}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
              {activeUser.title} · <span className="font-semibold">{activeUser.department}</span>
            </p>
          </div>
        </div>

        {/* Action button to choose another role */}
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 rounded-xl bg-muted/80 hover:bg-muted px-3 py-1.5 text-xs font-bold text-foreground transition-all ring-1 ring-border/80"
          >
            <Users className="size-3.5 text-brand" />
            <span>החלף פרופיל משתמש (פרק 1)</span>
            <ChevronDown className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>

          {open && (
            <div className="absolute left-0 top-full mt-2 z-50 w-80 sm:w-96 rounded-2xl border border-border bg-popover p-2 shadow-2xl backdrop-blur-lg">
              <div className="px-3 py-2 border-b border-border/60 text-xs font-black text-muted-foreground flex items-center justify-between">
                <span>מטריצת תפקידים והרשאות ח. סבן</span>
                <span className="text-[10px] text-brand">9 בעלי תפקידים</span>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-border/40 py-1">
                {(Object.keys(USER_ROLES) as UserRoleKey[]).map((key) => {
                  const role = USER_ROLES[key];
                  const isSelected = key === currentRole;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        onSelectRole(key);
                        setOpen(false);
                      }}
                      className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-right transition-colors hover:bg-muted/60 rounded-xl ${
                        isSelected ? "bg-muted/80" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="grid size-7 place-items-center rounded-lg text-white text-xs font-black"
                          style={{ backgroundColor: role.color }}
                        >
                          {role.avatar}
                        </div>
                        <div>
                          <div className="text-xs font-black text-foreground">{role.name}</div>
                          <div className="text-[11px] text-muted-foreground">{role.title}</div>
                        </div>
                      </div>
                      {isSelected && <CheckCircle2 className="size-4 text-brand shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scope description for current user */}
      <div className="mt-2.5 rounded-xl bg-muted/40 px-3 py-2 text-xs text-muted-foreground border-r-2 border-brand/70 flex items-start gap-2">
        <ShieldCheck className="size-4 text-brand shrink-0 mt-0.5" />
        <span>
          <strong className="text-foreground font-semibold">אחריות בתהליך: </strong>
          {activeUser.scopeDescription}
        </span>
      </div>
    </div>
  );
}
