import * as React from 'react';
import { View, Text } from 'react-native';
import { Controller, FormProvider, FieldPath, FieldValues, ControllerProps } from 'react-hook-form';
import { cn } from '@lib/utils';
import { Label } from '@components/ui/label';

const FormFieldContext = React.createContext<{ name: string } | undefined>(undefined);

const FormItemContext = React.createContext<{
  id: string;
} | undefined>(undefined);

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>');
  }

  const { id } = itemContext || { id: '' };

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
  };
};

const Form = FormProvider;

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const FormItem = React.forwardRef<
  React.ElementRef<typeof View>,
  React.ComponentPropsWithoutRef<typeof View>
>(({ className, ...props }, ref) => {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <View ref={ref} className={cn('space-y-2', className)} {...props} />
    </FormItemContext.Provider>
  );
});
FormItem.displayName = 'FormItem';

const FormLabel = React.forwardRef<
  React.ElementRef<typeof Label>,
  React.ComponentPropsWithoutRef<typeof Label>
>(({ className, ...props }, ref) => {
  const { formItemId } = useFormField();

  return (
    <Label
      className={cn(className)}
      nativeID={formItemId}
      {...props}
    />
  );
});
FormLabel.displayName = 'FormLabel';

const FormControl = React.forwardRef<
  React.ElementRef<typeof View>,
  React.ComponentPropsWithoutRef<typeof View>
>(({ ...props }, ref) => {
  const { formItemId, formDescriptionId, formMessageId } = useFormField();

  return (
    <View
      ref={ref}
      aria-describedby={
        formDescriptionId && formMessageId
          ? `${formDescriptionId} ${formMessageId}`
          : formDescriptionId || formMessageId
      }
      aria-labelledby={formItemId}
      {...props}
    />
  );
});
FormControl.displayName = 'FormControl';

const FormDescription = React.forwardRef<
  React.ElementRef<typeof Text>,
  React.ComponentPropsWithoutRef<typeof Text>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();

  return (
    <Text
      ref={ref}
      nativeID={formDescriptionId}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
});
FormDescription.displayName = 'FormDescription';

const FormMessage = React.forwardRef<
  React.ElementRef<typeof Text>,
  React.ComponentPropsWithoutRef<typeof Text>
>(({ className, children, ...props }, ref) => {
  const { formMessageId } = useFormField();

  if (!children) {
    return null;
  }

  return (
    <Text
      ref={ref}
      nativeID={formMessageId}
      className={cn('text-sm font-medium text-destructive', className)}
      {...props}
    >
      {children}
    </Text>
  );
});
FormMessage.displayName = 'FormMessage';

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormField,
  FormMessage,
}; 