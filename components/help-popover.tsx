"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { HelpCircle, Book, MessageCircle, Mail, ExternalLink } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"

export function HelpPopover() {
  const [isOpen, setIsOpen] = useState(false)

  const helpItems = [
    {
      icon: Book,
      title: "Getting Started",
      description: "Learn the basics of managing your CRM",
      action: () => console.log("Getting started clicked"),
    },
    {
      icon: MessageCircle,
      title: "Keyboard Shortcuts",
      description: "Speed up your workflow with shortcuts",
      shortcuts: [
        { key: "Ctrl + K", action: "Global search" },
        { key: "Ctrl + N", action: "Add organization" },
        { key: "Esc", action: "Close modals" },
      ],
    },
    {
      icon: Mail,
      title: "Contact Support",
      description: "Get help from our support team",
      action: () => window.open("mailto:support@example.com", "_blank"),
    },
  ]

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
          <HelpCircle className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2">Help & Support</h3>
          <p className="text-sm text-muted-foreground mb-4">Get help with using ACME Signal</p>
        </div>
        <Separator />
        <div className="p-2">
          {helpItems.map((item, index) => (
            <div key={index}>
              <div
                className="flex items-start gap-3 p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                onClick={item.action}
              >
                <item.icon className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm">{item.title}</h4>
                    {item.action && <ExternalLink className="h-3 w-3 text-muted-foreground" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                  {item.shortcuts && (
                    <div className="mt-2 space-y-1">
                      {item.shortcuts.map((shortcut, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{shortcut.action}</span>
                          <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">
                            {shortcut.key}
                          </kbd>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {index < helpItems.length - 1 && <Separator className="my-1" />}
            </div>
          ))}
        </div>
        <Separator />
        <div className="p-4">
          <div className="text-xs text-muted-foreground text-center">
            <p>Need more help?</p>
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs text-orange-500 hover:text-orange-600"
              onClick={() => window.open("https://docs.example.com", "_blank")}
            >
              Visit our documentation →
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
